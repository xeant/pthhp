"use server";

import { mkdir, writeFile } from "fs/promises";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import path from "path";
import { getUserSessionAction } from "@/modules/user/actions/user.action";
import { validateForm } from "@utils/validation/formValidator";
import { ActionState, AuthSettingsData, AuthSettingsSchema, NotificationSettingsData, NotificationSettingsSchema, SeoSettingsData, SeoSettingsSchema, SiteSettingsData, SiteSettingsSchema, UploadSettingsData, UploadSettingsSchema } from "./_type";
import { getPublicPageSitemapEntriesQuery, getPublicPostSitemapEntriesQuery, getSettingsByKeysQuery, SettingSeed, upsertSettingsQuery } from "./settings.query";
import redisClient from "@utils/redis/redis";
import { v4 as uuidv4 } from "uuid";
import { assertDecodableImage, detectMimeTypeFromBuffer, isMimeCompatibleWithExtension } from "@/core/utils/file/fileValidation";
import {
  AUTH_SETTING_KEYS,
  mapRecordsToAuthSettings,
  readAuthSettingsCache,
  toAuthSettingSeeds,
  writeAuthSettingsCache,
} from "./auth-settings";

const SITE_SETTINGS_CACHE_KEY = "app:settings:site";
const UPLOAD_SETTINGS_CACHE_KEY = "app:settings:upload";
const SEO_SETTINGS_CACHE_KEY = "app:settings:seo";
const NOTIFICATION_SETTINGS_CACHE_KEY = "app:settings:notification";
const SITE_SETTINGS_CACHE_TTL = 60 * 60 * 24;
const SITE_IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const SITE_IMAGE_ALLOWED_EXTS = new Set([".png", ".jpg", ".jpeg", ".gif", ".avif", ".webp", ".ico"]);
const SITE_IMAGE_ALLOWED_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/avif",
  "image/webp",
  "image/vnd.microsoft.icon",
  "image/x-icon",
]);

const SITE_SETTING_META = {
  appName: {
    key: "site.appName",
    env: "APP_NAME",
    label: "APP_NAME",
    fallback: "plextype",
    isPublic: true,
  },
  projectName: {
    key: "site.projectName",
    env: "PROJECT_NAME",
    label: "PROJECT_NAME",
    fallback: "plextype",
    isPublic: false,
  },
  projectTitle: {
    key: "site.projectTitle",
    env: "PROJECT_TITLE",
    label: "PROJECT_TITLE",
    fallback: "plextype",
    isPublic: true,
  },
  siteUrl: {
    key: "site.url",
    env: "NEXT_PUBLIC_DEFAULT_URL",
    label: "사이트 URL",
    fallback: "http://localhost:3000",
    isPublic: true,
  },
  apiBaseUrl: {
    key: "site.apiBaseUrl",
    env: "NEXT_PUBLIC_API_BASE_URL",
    label: "API Base URL",
    fallback: "",
    isPublic: true,
  },
  logoPath: {
    key: "site.logoPath",
    env: "SITE_LOGO_PATH",
    label: "로고 이미지",
    fallback: "",
    isPublic: true,
  },
  faviconPath: {
    key: "site.faviconPath",
    env: "SITE_FAVICON_PATH",
    label: "파비콘",
    fallback: "",
    isPublic: true,
  },
  defaultOgImage: {
    key: "site.defaultOgImage",
    env: "SITE_DEFAULT_OG_IMAGE",
    label: "기본 OG 이미지",
    fallback: "",
    isPublic: true,
  },
  adminLayout: {
    key: "site.adminLayout",
    env: "ADMIN_LAYOUT",
    label: "관리자 레이아웃",
    fallback: "default",
    isPublic: false,
  },
  userLayout: {
    key: "site.userLayout",
    env: "USER_LAYOUT",
    label: "사용자 레이아웃",
    fallback: "default",
    isPublic: false,
  },
} as const;

const SITE_SETTING_KEYS = Object.values(SITE_SETTING_META).map((item) => item.key);

const UPLOAD_SETTING_META = {
  maxUploadSizeMb: {
    key: "upload.maxUploadSizeMb",
    label: "파일당 MB",
    fallback: "20",
    isPublic: false,
  },
  userStorageLimitMb: {
    key: "upload.userStorageLimitMb",
    label: "사용자별 MB",
    fallback: "1024",
    isPublic: false,
  },
  maxImageWidth: {
    key: "upload.maxImageWidth",
    label: "이미지 최대 너비",
    fallback: "2560",
    isPublic: false,
  },
  maxImageHeight: {
    key: "upload.maxImageHeight",
    label: "이미지 최대 높이",
    fallback: "2560",
    isPublic: false,
  },
  imageQuality: {
    key: "upload.imageQuality",
    label: "이미지 품질",
    fallback: "85",
    isPublic: false,
  },
  imageOutputFormat: {
    key: "upload.imageOutputFormat",
    label: "이미지 출력 포맷",
    fallback: "original",
    isPublic: false,
  },
  allowedExtensions: {
    key: "upload.allowedExtensions",
    label: "허용 확장자",
    fallback: ".png, .jpg, .jpeg, .gif, .webp, .avif, .mp3, .ogg, .mp4, .webm, .mov, .zip",
    isPublic: false,
  },
  enableImageProcessing: {
    key: "upload.enableImageProcessing",
    label: "이미지 처리 사용",
    fallback: "true",
    isPublic: false,
  },
  stripImageMetadata: {
    key: "upload.stripImageMetadata",
    label: "이미지 메타데이터 제거",
    fallback: "true",
    isPublic: false,
  },
  verifyMimeType: {
    key: "upload.verifyMimeType",
    label: "MIME 타입 검증",
    fallback: "true",
    isPublic: false,
  },
  restrictProfileImage: {
    key: "upload.restrictProfileImage",
    label: "프로필 이미지 제한",
    fallback: "true",
    isPublic: false,
  },
  allowVideo: {
    key: "upload.allowVideo",
    label: "동영상 허용",
    fallback: "true",
    isPublic: false,
  },
  allowArchive: {
    key: "upload.allowArchive",
    label: "압축파일 허용",
    fallback: "true",
    isPublic: false,
  },
} as const;

const UPLOAD_SETTING_KEYS = Object.values(UPLOAD_SETTING_META).map((item) => item.key);

const SEO_SETTING_META = {
  defaultTitle: {
    key: "seo.defaultTitle",
    label: "기본 메타 제목",
    fallback: "Plextype",
    isPublic: true,
  },
  titleTemplate: {
    key: "seo.titleTemplate",
    label: "타이틀 규칙",
    fallback: "%s | Plextype",
    isPublic: true,
  },
  metaDescription: {
    key: "seo.metaDescription",
    label: "기본 메타 설명",
    fallback: "Plextype으로 만든 사이트입니다.",
    isPublic: true,
  },
  keywords: {
    key: "seo.keywords",
    label: "기본 키워드",
    fallback: "",
    isPublic: true,
  },
  robotsIndex: {
    key: "seo.robotsIndex",
    label: "색인 정책",
    fallback: "index",
    isPublic: true,
  },
  robotsFollow: {
    key: "seo.robotsFollow",
    label: "링크 추적 정책",
    fallback: "follow",
    isPublic: true,
  },
  twitterCard: {
    key: "seo.twitterCard",
    label: "Twitter 카드",
    fallback: "summary_large_image",
    isPublic: true,
  },
  sitemapEnabled: {
    key: "seo.sitemapEnabled",
    label: "사이트맵 사용",
    fallback: "true",
    isPublic: true,
  },
  includePagesInSitemap: {
    key: "seo.includePagesInSitemap",
    label: "페이지 사이트맵 포함",
    fallback: "true",
    isPublic: true,
  },
  includePostsInSitemap: {
    key: "seo.includePostsInSitemap",
    label: "게시글 사이트맵 포함",
    fallback: "true",
    isPublic: true,
  },
} as const;

const SEO_SETTING_KEYS = Object.values(SEO_SETTING_META).map((item) => item.key);

const NOTIFICATION_SETTING_META = {
  commentNotificationsEnabled: {
    key: "notification.commentNotificationsEnabled",
    label: "댓글 알림",
    fallback: "true",
    isPublic: false,
  },
  replyNotificationsEnabled: {
    key: "notification.replyNotificationsEnabled",
    label: "답글 알림",
    fallback: "true",
    isPublic: false,
  },
  adminContentNotificationsEnabled: {
    key: "notification.adminContentNotificationsEnabled",
    label: "관리자 처리 알림",
    fallback: "true",
    isPublic: false,
  },
  forceLogoutNotificationsEnabled: {
    key: "notification.forceLogoutNotificationsEnabled",
    label: "강제 로그아웃 알림",
    fallback: "true",
    isPublic: false,
  },
  pwaEnabled: {
    key: "notification.pwaEnabled",
    label: "PWA 사용",
    fallback: "true",
    isPublic: true,
  },
  webPushEnabled: {
    key: "notification.webPushEnabled",
    label: "Web Push 사용",
    fallback: "true",
    isPublic: true,
  },
  fcmPushEnabled: {
    key: "notification.fcmPushEnabled",
    label: "FCM 모바일 푸시 사용",
    fallback: "true",
    isPublic: false,
  },
  excludeSelfNotifications: {
    key: "notification.excludeSelfNotifications",
    label: "본인 액션 제외",
    fallback: "true",
    isPublic: false,
  },
  realtimeNotificationsEnabled: {
    key: "notification.realtimeNotificationsEnabled",
    label: "실시간 알림",
    fallback: "true",
    isPublic: false,
  },
  toastNotificationsEnabled: {
    key: "notification.toastNotificationsEnabled",
    label: "토스트 표시",
    fallback: "true",
    isPublic: false,
  },
  showNotificationThumbnails: {
    key: "notification.showNotificationThumbnails",
    label: "썸네일 표시",
    fallback: "true",
    isPublic: false,
  },
  unreadPreviewLimit: {
    key: "notification.unreadPreviewLimit",
    label: "메뉴 미리보기 개수",
    fallback: "20",
    isPublic: false,
  },
  historyPageSize: {
    key: "notification.historyPageSize",
    label: "히스토리 페이지 개수",
    fallback: "20",
    isPublic: false,
  },
  retentionDays: {
    key: "notification.retentionDays",
    label: "보관 기간",
    fallback: "90",
    isPublic: false,
  },
} as const;

const NOTIFICATION_SETTING_KEYS = Object.values(NOTIFICATION_SETTING_META).map((item) => item.key);

const getEnvFallback = (name: keyof typeof SITE_SETTING_META) => {
  const meta = SITE_SETTING_META[name];
  return process.env[meta.env] || meta.fallback;
};

const mapRecordsToSiteSettings = (records: Awaited<ReturnType<typeof getSettingsByKeysQuery>>): SiteSettingsData => {
  const values = new Map(records.map((record) => [record.key, record.value || ""]));

  return {
    appName: values.get(SITE_SETTING_META.appName.key) || getEnvFallback("appName"),
    projectName: values.get(SITE_SETTING_META.projectName.key) || getEnvFallback("projectName"),
    projectTitle: values.get(SITE_SETTING_META.projectTitle.key) || getEnvFallback("projectTitle"),
    siteUrl: values.get(SITE_SETTING_META.siteUrl.key) || getEnvFallback("siteUrl"),
    apiBaseUrl: values.get(SITE_SETTING_META.apiBaseUrl.key) || getEnvFallback("apiBaseUrl"),
    logoPath: values.get(SITE_SETTING_META.logoPath.key) || getEnvFallback("logoPath"),
    faviconPath: values.get(SITE_SETTING_META.faviconPath.key) || getEnvFallback("faviconPath"),
    defaultOgImage: values.get(SITE_SETTING_META.defaultOgImage.key) || getEnvFallback("defaultOgImage"),
    adminLayout: values.get(SITE_SETTING_META.adminLayout.key) || getEnvFallback("adminLayout"),
    userLayout: values.get(SITE_SETTING_META.userLayout.key) || getEnvFallback("userLayout"),
  };
};

const readSiteSettingsCache = async (): Promise<SiteSettingsData | null> => {
  try {
    const cached = await redisClient.get(SITE_SETTINGS_CACHE_KEY);
    if (!cached) return null;

    return SiteSettingsSchema.parse(JSON.parse(cached));
  } catch (error) {
    console.warn("readSiteSettingsCache Warning:", error);
    return null;
  }
};

const readUploadSettingsCache = async (): Promise<UploadSettingsData | null> => {
  try {
    const cached = await redisClient.get(UPLOAD_SETTINGS_CACHE_KEY);
    if (!cached) return null;

    return UploadSettingsSchema.parse(JSON.parse(cached));
  } catch (error) {
    console.warn("readUploadSettingsCache Warning:", error);
    return null;
  }
};

const readSeoSettingsCache = async (): Promise<SeoSettingsData | null> => {
  try {
    const cached = await redisClient.get(SEO_SETTINGS_CACHE_KEY);
    if (!cached) return null;

    return SeoSettingsSchema.parse(JSON.parse(cached));
  } catch (error) {
    console.warn("readSeoSettingsCache Warning:", error);
    return null;
  }
};

const readNotificationSettingsCache = async (): Promise<NotificationSettingsData | null> => {
  try {
    const cached = await redisClient.get(NOTIFICATION_SETTINGS_CACHE_KEY);
    if (!cached) return null;

    return NotificationSettingsSchema.parse(JSON.parse(cached));
  } catch (error) {
    console.warn("readNotificationSettingsCache Warning:", error);
    return null;
  }
};

const writeSiteSettingsCache = async (data: SiteSettingsData) => {
  try {
    await redisClient.set(
      SITE_SETTINGS_CACHE_KEY,
      JSON.stringify(data),
      "EX",
      SITE_SETTINGS_CACHE_TTL,
    );
  } catch (error) {
    console.warn("writeSiteSettingsCache Warning:", error);
  }
};

const writeUploadSettingsCache = async (data: UploadSettingsData) => {
  try {
    await redisClient.set(
      UPLOAD_SETTINGS_CACHE_KEY,
      JSON.stringify(data),
      "EX",
      SITE_SETTINGS_CACHE_TTL,
    );
  } catch (error) {
    console.warn("writeUploadSettingsCache Warning:", error);
  }
};

const writeSeoSettingsCache = async (data: SeoSettingsData) => {
  try {
    await redisClient.set(
      SEO_SETTINGS_CACHE_KEY,
      JSON.stringify(data),
      "EX",
      SITE_SETTINGS_CACHE_TTL,
    );
  } catch (error) {
    console.warn("writeSeoSettingsCache Warning:", error);
  }
};

const writeNotificationSettingsCache = async (data: NotificationSettingsData) => {
  try {
    await redisClient.set(
      NOTIFICATION_SETTINGS_CACHE_KEY,
      JSON.stringify(data),
      "EX",
      SITE_SETTINGS_CACHE_TTL,
    );
  } catch (error) {
    console.warn("writeNotificationSettingsCache Warning:", error);
  }
};

const toBool = (value: string | null | undefined, fallback: boolean) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
};

const mapRecordsToSeoSettings = (records: Awaited<ReturnType<typeof getSettingsByKeysQuery>>): SeoSettingsData => {
  const values = new Map(records.map((record) => [record.key, record.value || ""]));

  return {
    defaultTitle: values.get(SEO_SETTING_META.defaultTitle.key) || SEO_SETTING_META.defaultTitle.fallback,
    titleTemplate: values.get(SEO_SETTING_META.titleTemplate.key) || SEO_SETTING_META.titleTemplate.fallback,
    metaDescription: values.get(SEO_SETTING_META.metaDescription.key) || SEO_SETTING_META.metaDescription.fallback,
    keywords: values.get(SEO_SETTING_META.keywords.key) || SEO_SETTING_META.keywords.fallback,
    robotsIndex: (values.get(SEO_SETTING_META.robotsIndex.key) || SEO_SETTING_META.robotsIndex.fallback) as SeoSettingsData["robotsIndex"],
    robotsFollow: (values.get(SEO_SETTING_META.robotsFollow.key) || SEO_SETTING_META.robotsFollow.fallback) as SeoSettingsData["robotsFollow"],
    twitterCard: (values.get(SEO_SETTING_META.twitterCard.key) || SEO_SETTING_META.twitterCard.fallback) as SeoSettingsData["twitterCard"],
    sitemapEnabled: toBool(values.get(SEO_SETTING_META.sitemapEnabled.key), true),
    includePagesInSitemap: toBool(values.get(SEO_SETTING_META.includePagesInSitemap.key), true),
    includePostsInSitemap: toBool(values.get(SEO_SETTING_META.includePostsInSitemap.key), true),
  };
};

const mapRecordsToNotificationSettings = (records: Awaited<ReturnType<typeof getSettingsByKeysQuery>>): NotificationSettingsData => {
  const values = new Map(records.map((record) => [record.key, record.value || ""]));

  return {
    commentNotificationsEnabled: toBool(values.get(NOTIFICATION_SETTING_META.commentNotificationsEnabled.key), true),
    replyNotificationsEnabled: toBool(values.get(NOTIFICATION_SETTING_META.replyNotificationsEnabled.key), true),
    adminContentNotificationsEnabled: toBool(values.get(NOTIFICATION_SETTING_META.adminContentNotificationsEnabled.key), true),
    forceLogoutNotificationsEnabled: toBool(values.get(NOTIFICATION_SETTING_META.forceLogoutNotificationsEnabled.key), true),
    pwaEnabled: toBool(values.get(NOTIFICATION_SETTING_META.pwaEnabled.key), true),
    webPushEnabled: toBool(values.get(NOTIFICATION_SETTING_META.webPushEnabled.key), true),
    fcmPushEnabled: toBool(values.get(NOTIFICATION_SETTING_META.fcmPushEnabled.key), true),
    excludeSelfNotifications: toBool(values.get(NOTIFICATION_SETTING_META.excludeSelfNotifications.key), true),
    realtimeNotificationsEnabled: toBool(values.get(NOTIFICATION_SETTING_META.realtimeNotificationsEnabled.key), true),
    toastNotificationsEnabled: toBool(values.get(NOTIFICATION_SETTING_META.toastNotificationsEnabled.key), true),
    showNotificationThumbnails: toBool(values.get(NOTIFICATION_SETTING_META.showNotificationThumbnails.key), true),
    unreadPreviewLimit: Number(values.get(NOTIFICATION_SETTING_META.unreadPreviewLimit.key) || NOTIFICATION_SETTING_META.unreadPreviewLimit.fallback),
    historyPageSize: Number(values.get(NOTIFICATION_SETTING_META.historyPageSize.key) || NOTIFICATION_SETTING_META.historyPageSize.fallback),
    retentionDays: Number(values.get(NOTIFICATION_SETTING_META.retentionDays.key) || NOTIFICATION_SETTING_META.retentionDays.fallback),
  };
};

const mapRecordsToUploadSettings = (records: Awaited<ReturnType<typeof getSettingsByKeysQuery>>): UploadSettingsData => {
  const values = new Map(records.map((record) => [record.key, record.value || ""]));

  return {
    maxUploadSizeMb: Number(values.get(UPLOAD_SETTING_META.maxUploadSizeMb.key) || UPLOAD_SETTING_META.maxUploadSizeMb.fallback),
    userStorageLimitMb: Number(values.get(UPLOAD_SETTING_META.userStorageLimitMb.key) || UPLOAD_SETTING_META.userStorageLimitMb.fallback),
    maxImageWidth: Number(values.get(UPLOAD_SETTING_META.maxImageWidth.key) || UPLOAD_SETTING_META.maxImageWidth.fallback),
    maxImageHeight: Number(values.get(UPLOAD_SETTING_META.maxImageHeight.key) || UPLOAD_SETTING_META.maxImageHeight.fallback),
    imageQuality: Number(values.get(UPLOAD_SETTING_META.imageQuality.key) || UPLOAD_SETTING_META.imageQuality.fallback),
    imageOutputFormat: (values.get(UPLOAD_SETTING_META.imageOutputFormat.key) || UPLOAD_SETTING_META.imageOutputFormat.fallback) as UploadSettingsData["imageOutputFormat"],
    allowedExtensions: values.get(UPLOAD_SETTING_META.allowedExtensions.key) || UPLOAD_SETTING_META.allowedExtensions.fallback,
    enableImageProcessing: toBool(values.get(UPLOAD_SETTING_META.enableImageProcessing.key), true),
    stripImageMetadata: toBool(values.get(UPLOAD_SETTING_META.stripImageMetadata.key), true),
    verifyMimeType: toBool(values.get(UPLOAD_SETTING_META.verifyMimeType.key), true),
    restrictProfileImage: toBool(values.get(UPLOAD_SETTING_META.restrictProfileImage.key), true),
    allowVideo: toBool(values.get(UPLOAD_SETTING_META.allowVideo.key), true),
    allowArchive: toBool(values.get(UPLOAD_SETTING_META.allowArchive.key), true),
  };
};

const toSettingSeeds = (data: SiteSettingsData): SettingSeed[] => {
  return [
    {
      key: SITE_SETTING_META.appName.key,
      value: data.appName,
      group: "site",
      label: SITE_SETTING_META.appName.label,
      description: "사이트 영문 시스템 이름입니다.",
      isPublic: SITE_SETTING_META.appName.isPublic,
    },
    {
      key: SITE_SETTING_META.projectName.key,
      value: data.projectName,
      group: "site",
      label: SITE_SETTING_META.projectName.label,
      description: "프로젝트 내부 식별 이름입니다.",
      isPublic: SITE_SETTING_META.projectName.isPublic,
    },
    {
      key: SITE_SETTING_META.projectTitle.key,
      value: data.projectTitle,
      group: "site",
      label: SITE_SETTING_META.projectTitle.label,
      description: "사용자 화면에 노출되는 사이트 표시명입니다.",
      isPublic: SITE_SETTING_META.projectTitle.isPublic,
    },
    {
      key: SITE_SETTING_META.siteUrl.key,
      value: data.siteUrl,
      group: "site",
      label: SITE_SETTING_META.siteUrl.label,
      description: "사이트 대표 URL입니다.",
      isPublic: SITE_SETTING_META.siteUrl.isPublic,
    },
    {
      key: SITE_SETTING_META.apiBaseUrl.key,
      value: data.apiBaseUrl || "",
      group: "site",
      label: SITE_SETTING_META.apiBaseUrl.label,
      description: "외부에서 사용할 API 기본 URL입니다.",
      isPublic: SITE_SETTING_META.apiBaseUrl.isPublic,
    },
    {
      key: SITE_SETTING_META.logoPath.key,
      value: data.logoPath || "",
      group: "site",
      label: SITE_SETTING_META.logoPath.label,
      description: "사이트 로고 이미지 경로입니다.",
      isPublic: SITE_SETTING_META.logoPath.isPublic,
    },
    {
      key: SITE_SETTING_META.faviconPath.key,
      value: data.faviconPath || "",
      group: "site",
      label: SITE_SETTING_META.faviconPath.label,
      description: "브라우저 탭과 북마크에 사용할 파비콘 경로입니다.",
      isPublic: SITE_SETTING_META.faviconPath.isPublic,
    },
    {
      key: SITE_SETTING_META.defaultOgImage.key,
      value: data.defaultOgImage || "",
      group: "site",
      label: SITE_SETTING_META.defaultOgImage.label,
      description: "공유 메타 태그에 사용할 기본 OG 이미지 경로입니다.",
      isPublic: SITE_SETTING_META.defaultOgImage.isPublic,
    },
    {
      key: SITE_SETTING_META.adminLayout.key,
      value: data.adminLayout || SITE_SETTING_META.adminLayout.fallback,
      group: "site",
      label: SITE_SETTING_META.adminLayout.label,
      description: "관리자 화면에서 사용할 레이아웃 스킨입니다.",
      isPublic: SITE_SETTING_META.adminLayout.isPublic,
    },
    {
      key: SITE_SETTING_META.userLayout.key,
      value: data.userLayout || SITE_SETTING_META.userLayout.fallback,
      group: "site",
      label: SITE_SETTING_META.userLayout.label,
      description: "사용자 마이페이지에서 사용할 레이아웃 스킨입니다.",
      isPublic: SITE_SETTING_META.userLayout.isPublic,
    },
  ];
};

const toUploadSettingSeeds = (data: UploadSettingsData): SettingSeed[] => {
  return [
    {
      key: UPLOAD_SETTING_META.maxUploadSizeMb.key,
      value: String(data.maxUploadSizeMb),
      group: "upload",
      label: UPLOAD_SETTING_META.maxUploadSizeMb.label,
      description: "첨부파일 1개당 허용할 최대 용량입니다.",
      isPublic: UPLOAD_SETTING_META.maxUploadSizeMb.isPublic,
    },
    {
      key: UPLOAD_SETTING_META.userStorageLimitMb.key,
      value: String(data.userStorageLimitMb),
      group: "upload",
      label: UPLOAD_SETTING_META.userStorageLimitMb.label,
      description: "사용자별 전체 첨부파일 보관 용량입니다.",
      isPublic: UPLOAD_SETTING_META.userStorageLimitMb.isPublic,
    },
    {
      key: UPLOAD_SETTING_META.maxImageWidth.key,
      value: String(data.maxImageWidth),
      group: "upload",
      label: UPLOAD_SETTING_META.maxImageWidth.label,
      description: "이미지 업로드 시 기준으로 사용할 최대 너비입니다.",
      isPublic: UPLOAD_SETTING_META.maxImageWidth.isPublic,
    },
    {
      key: UPLOAD_SETTING_META.maxImageHeight.key,
      value: String(data.maxImageHeight),
      group: "upload",
      label: UPLOAD_SETTING_META.maxImageHeight.label,
      description: "이미지 업로드 시 기준으로 사용할 최대 높이입니다.",
      isPublic: UPLOAD_SETTING_META.maxImageHeight.isPublic,
    },
    {
      key: UPLOAD_SETTING_META.imageQuality.key,
      value: String(data.imageQuality),
      group: "upload",
      label: UPLOAD_SETTING_META.imageQuality.label,
      description: "이미지 압축 기능이 활성화될 때 사용할 품질 값입니다.",
      isPublic: UPLOAD_SETTING_META.imageQuality.isPublic,
    },
    {
      key: UPLOAD_SETTING_META.imageOutputFormat.key,
      value: data.imageOutputFormat,
      group: "upload",
      label: UPLOAD_SETTING_META.imageOutputFormat.label,
      description: "sharp 처리 후 저장할 이미지 포맷입니다.",
      isPublic: UPLOAD_SETTING_META.imageOutputFormat.isPublic,
    },
    {
      key: UPLOAD_SETTING_META.allowedExtensions.key,
      value: data.allowedExtensions,
      group: "upload",
      label: UPLOAD_SETTING_META.allowedExtensions.label,
      description: "업로드를 허용할 확장자 목록입니다.",
      isPublic: UPLOAD_SETTING_META.allowedExtensions.isPublic,
    },
    {
      key: UPLOAD_SETTING_META.enableImageProcessing.key,
      value: String(data.enableImageProcessing),
      group: "upload",
      label: UPLOAD_SETTING_META.enableImageProcessing.label,
      description: "이미지 리사이즈와 품질 처리를 적용합니다.",
      isPublic: UPLOAD_SETTING_META.enableImageProcessing.isPublic,
    },
    {
      key: UPLOAD_SETTING_META.stripImageMetadata.key,
      value: String(data.stripImageMetadata),
      group: "upload",
      label: UPLOAD_SETTING_META.stripImageMetadata.label,
      description: "이미지 저장 시 EXIF 등 메타데이터를 제거합니다.",
      isPublic: UPLOAD_SETTING_META.stripImageMetadata.isPublic,
    },
    {
      key: UPLOAD_SETTING_META.verifyMimeType.key,
      value: String(data.verifyMimeType),
      group: "upload",
      label: UPLOAD_SETTING_META.verifyMimeType.label,
      description: "파일 MIME 타입을 함께 검증합니다.",
      isPublic: UPLOAD_SETTING_META.verifyMimeType.isPublic,
    },
    {
      key: UPLOAD_SETTING_META.restrictProfileImage.key,
      value: String(data.restrictProfileImage),
      group: "upload",
      label: UPLOAD_SETTING_META.restrictProfileImage.label,
      description: "프로필 이미지 업로드 시 이미지 파일만 허용하는 정책입니다.",
      isPublic: UPLOAD_SETTING_META.restrictProfileImage.isPublic,
    },
    {
      key: UPLOAD_SETTING_META.allowVideo.key,
      value: String(data.allowVideo),
      group: "upload",
      label: UPLOAD_SETTING_META.allowVideo.label,
      description: "동영상 첨부파일 업로드 허용 여부입니다.",
      isPublic: UPLOAD_SETTING_META.allowVideo.isPublic,
    },
    {
      key: UPLOAD_SETTING_META.allowArchive.key,
      value: String(data.allowArchive),
      group: "upload",
      label: UPLOAD_SETTING_META.allowArchive.label,
      description: "압축파일 첨부파일 업로드 허용 여부입니다.",
      isPublic: UPLOAD_SETTING_META.allowArchive.isPublic,
    },
  ];
};

const toSeoSettingSeeds = (data: SeoSettingsData): SettingSeed[] => {
  return [
    {
      key: SEO_SETTING_META.defaultTitle.key,
      value: data.defaultTitle,
      group: "seo",
      label: SEO_SETTING_META.defaultTitle.label,
      description: "사이트 기본 메타 제목입니다.",
      isPublic: SEO_SETTING_META.defaultTitle.isPublic,
    },
    {
      key: SEO_SETTING_META.titleTemplate.key,
      value: data.titleTemplate,
      group: "seo",
      label: SEO_SETTING_META.titleTemplate.label,
      description: "%s 자리에 페이지 제목을 넣어 최종 title을 만듭니다.",
      isPublic: SEO_SETTING_META.titleTemplate.isPublic,
    },
    {
      key: SEO_SETTING_META.metaDescription.key,
      value: data.metaDescription,
      group: "seo",
      label: SEO_SETTING_META.metaDescription.label,
      description: "문서별 설명이 없을 때 사용할 기본 메타 설명입니다.",
      isPublic: SEO_SETTING_META.metaDescription.isPublic,
    },
    {
      key: SEO_SETTING_META.keywords.key,
      value: data.keywords || "",
      group: "seo",
      label: SEO_SETTING_META.keywords.label,
      description: "쉼표로 구분한 기본 키워드입니다.",
      isPublic: SEO_SETTING_META.keywords.isPublic,
    },
    {
      key: SEO_SETTING_META.robotsIndex.key,
      value: data.robotsIndex,
      group: "seo",
      label: SEO_SETTING_META.robotsIndex.label,
      description: "검색엔진 색인 허용 여부입니다.",
      isPublic: SEO_SETTING_META.robotsIndex.isPublic,
    },
    {
      key: SEO_SETTING_META.robotsFollow.key,
      value: data.robotsFollow,
      group: "seo",
      label: SEO_SETTING_META.robotsFollow.label,
      description: "검색엔진 링크 추적 허용 여부입니다.",
      isPublic: SEO_SETTING_META.robotsFollow.isPublic,
    },
    {
      key: SEO_SETTING_META.twitterCard.key,
      value: data.twitterCard,
      group: "seo",
      label: SEO_SETTING_META.twitterCard.label,
      description: "소셜 공유 시 사용할 Twitter 카드 타입입니다.",
      isPublic: SEO_SETTING_META.twitterCard.isPublic,
    },
    {
      key: SEO_SETTING_META.sitemapEnabled.key,
      value: String(data.sitemapEnabled),
      group: "seo",
      label: SEO_SETTING_META.sitemapEnabled.label,
      description: "동적 사이트맵 생성 여부입니다.",
      isPublic: SEO_SETTING_META.sitemapEnabled.isPublic,
    },
    {
      key: SEO_SETTING_META.includePagesInSitemap.key,
      value: String(data.includePagesInSitemap),
      group: "seo",
      label: SEO_SETTING_META.includePagesInSitemap.label,
      description: "공개 페이지 메뉴를 사이트맵에 포함할지 정합니다.",
      isPublic: SEO_SETTING_META.includePagesInSitemap.isPublic,
    },
    {
      key: SEO_SETTING_META.includePostsInSitemap.key,
      value: String(data.includePostsInSitemap),
      group: "seo",
      label: SEO_SETTING_META.includePostsInSitemap.label,
      description: "공개 게시글을 사이트맵에 포함할지 정합니다.",
      isPublic: SEO_SETTING_META.includePostsInSitemap.isPublic,
    },
  ];
};

const toNotificationSettingSeeds = (data: NotificationSettingsData): SettingSeed[] => {
  return [
    {
      key: NOTIFICATION_SETTING_META.commentNotificationsEnabled.key,
      value: String(data.commentNotificationsEnabled),
      group: "notification",
      label: NOTIFICATION_SETTING_META.commentNotificationsEnabled.label,
      description: "게시글에 새 댓글이 달렸을 때 작성자에게 알림을 보냅니다.",
      isPublic: NOTIFICATION_SETTING_META.commentNotificationsEnabled.isPublic,
    },
    {
      key: NOTIFICATION_SETTING_META.replyNotificationsEnabled.key,
      value: String(data.replyNotificationsEnabled),
      group: "notification",
      label: NOTIFICATION_SETTING_META.replyNotificationsEnabled.label,
      description: "내 댓글에 답글이 달렸을 때 알림을 보냅니다.",
      isPublic: NOTIFICATION_SETTING_META.replyNotificationsEnabled.isPublic,
    },
    {
      key: NOTIFICATION_SETTING_META.adminContentNotificationsEnabled.key,
      value: String(data.adminContentNotificationsEnabled),
      group: "notification",
      label: NOTIFICATION_SETTING_META.adminContentNotificationsEnabled.label,
      description: "관리자가 게시글, 댓글, 첨부파일을 처리했을 때 작성자에게 알림을 보냅니다.",
      isPublic: NOTIFICATION_SETTING_META.adminContentNotificationsEnabled.isPublic,
    },
    {
      key: NOTIFICATION_SETTING_META.forceLogoutNotificationsEnabled.key,
      value: String(data.forceLogoutNotificationsEnabled),
      group: "notification",
      label: NOTIFICATION_SETTING_META.forceLogoutNotificationsEnabled.label,
      description: "관리자가 사용자를 강제 로그아웃했을 때 알림을 보냅니다.",
      isPublic: NOTIFICATION_SETTING_META.forceLogoutNotificationsEnabled.isPublic,
    },
    {
      key: NOTIFICATION_SETTING_META.pwaEnabled.key,
      value: String(data.pwaEnabled),
      group: "notification",
      label: NOTIFICATION_SETTING_META.pwaEnabled.label,
      description: "매니페스트, 서비스워커, 설치 버튼 같은 PWA 기능을 활성화합니다.",
      isPublic: NOTIFICATION_SETTING_META.pwaEnabled.isPublic,
    },
    {
      key: NOTIFICATION_SETTING_META.webPushEnabled.key,
      value: String(data.webPushEnabled),
      group: "notification",
      label: NOTIFICATION_SETTING_META.webPushEnabled.label,
      description: "브라우저 PushSubscription 등록과 Web Push 발송을 활성화합니다.",
      isPublic: NOTIFICATION_SETTING_META.webPushEnabled.isPublic,
    },
    {
      key: NOTIFICATION_SETTING_META.fcmPushEnabled.key,
      value: String(data.fcmPushEnabled),
      group: "notification",
      label: NOTIFICATION_SETTING_META.fcmPushEnabled.label,
      description: "모바일 앱 FCM 토큰 등록과 Firebase 푸시 발송을 활성화합니다.",
      isPublic: NOTIFICATION_SETTING_META.fcmPushEnabled.isPublic,
    },
    {
      key: NOTIFICATION_SETTING_META.excludeSelfNotifications.key,
      value: String(data.excludeSelfNotifications),
      group: "notification",
      label: NOTIFICATION_SETTING_META.excludeSelfNotifications.label,
      description: "내가 만든 액션으로 나에게 알림이 가지 않도록 합니다.",
      isPublic: NOTIFICATION_SETTING_META.excludeSelfNotifications.isPublic,
    },
    {
      key: NOTIFICATION_SETTING_META.realtimeNotificationsEnabled.key,
      value: String(data.realtimeNotificationsEnabled),
      group: "notification",
      label: NOTIFICATION_SETTING_META.realtimeNotificationsEnabled.label,
      description: "알림 저장 후 SSE로 즉시 전달합니다.",
      isPublic: NOTIFICATION_SETTING_META.realtimeNotificationsEnabled.isPublic,
    },
    {
      key: NOTIFICATION_SETTING_META.toastNotificationsEnabled.key,
      value: String(data.toastNotificationsEnabled),
      group: "notification",
      label: NOTIFICATION_SETTING_META.toastNotificationsEnabled.label,
      description: "실시간 알림을 토스트로 표시합니다.",
      isPublic: NOTIFICATION_SETTING_META.toastNotificationsEnabled.isPublic,
    },
    {
      key: NOTIFICATION_SETTING_META.showNotificationThumbnails.key,
      value: String(data.showNotificationThumbnails),
      group: "notification",
      label: NOTIFICATION_SETTING_META.showNotificationThumbnails.label,
      description: "알림 목록과 토스트에서 이미지 썸네일을 표시합니다.",
      isPublic: NOTIFICATION_SETTING_META.showNotificationThumbnails.isPublic,
    },
    {
      key: NOTIFICATION_SETTING_META.unreadPreviewLimit.key,
      value: String(data.unreadPreviewLimit),
      group: "notification",
      label: NOTIFICATION_SETTING_META.unreadPreviewLimit.label,
      description: "읽지 않은 알림 API가 한 번에 가져올 최대 개수입니다.",
      isPublic: NOTIFICATION_SETTING_META.unreadPreviewLimit.isPublic,
    },
    {
      key: NOTIFICATION_SETTING_META.historyPageSize.key,
      value: String(data.historyPageSize),
      group: "notification",
      label: NOTIFICATION_SETTING_META.historyPageSize.label,
      description: "알림 기록 화면의 기본 페이지 크기입니다.",
      isPublic: NOTIFICATION_SETTING_META.historyPageSize.isPublic,
    },
    {
      key: NOTIFICATION_SETTING_META.retentionDays.key,
      value: String(data.retentionDays),
      group: "notification",
      label: NOTIFICATION_SETTING_META.retentionDays.label,
      description: "알림 기록을 보관할 일수입니다.",
      isPublic: NOTIFICATION_SETTING_META.retentionDays.isPublic,
    },
  ];
};

const isFileLike = (value: FormDataEntryValue | null): value is File => {
  return typeof value === "object" && value !== null && "arrayBuffer" in value && "size" in value && "name" in value;
};

const saveSiteImage = async (file: File, fieldLabel: string) => {
  if (!file.size) return null;
  if (file.size > SITE_IMAGE_MAX_SIZE) {
    throw new Error(`${fieldLabel}는 5MB 이하의 이미지만 업로드할 수 있습니다.`);
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!SITE_IMAGE_ALLOWED_EXTS.has(ext)) {
    throw new Error(`${fieldLabel}의 파일 확장자가 허용되지 않습니다.`);
  }

  if (file.type && !SITE_IMAGE_ALLOWED_MIMES.has(file.type)) {
    throw new Error(`${fieldLabel}의 파일 형식이 허용되지 않습니다.`);
  }

  const bytes = await file.arrayBuffer();
  const fileBuffer = Buffer.from(bytes);
  const detectedMimeType = detectMimeTypeFromBuffer(fileBuffer);

  if (!detectedMimeType || !SITE_IMAGE_ALLOWED_MIMES.has(detectedMimeType) || !isMimeCompatibleWithExtension(ext, detectedMimeType)) {
    throw new Error(`${fieldLabel}의 실제 파일 형식이 확장자와 일치하지 않습니다.`);
  }

  try {
    await assertDecodableImage(fileBuffer, detectedMimeType);
  } catch {
    throw new Error(`${fieldLabel} 이미지를 정상적으로 해석할 수 없습니다.`);
  }

  const fileUuid = uuidv4();
  const date = new Date();
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const fileName = `${fileUuid}${ext}`;
  const relativeDir = path.join("settings", year, month);
  const uploadDir = path.join(
    /* turbopackIgnore: true */ process.cwd(),
    "storage",
    "uploads",
    relativeDir,
  );

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), fileBuffer);

  return `/storage/uploads/settings/${year}/${month}/${fileName}`;
};

export const getSiteSettingsAdminAction = async (): Promise<ActionState<SiteSettingsData>> => {
  const sessionInfo = await getUserSessionAction();

  if (!sessionInfo?.data?.isAdmin) {
    return { success: false, type: "error", message: "관리자 권한이 필요합니다." };
  }

  try {
    const cached = await readSiteSettingsCache();
    if (cached) {
      return {
        success: true,
        type: "success",
        message: "사이트 기본정보를 불러왔습니다.",
        data: cached,
      };
    }

    const records = await getSettingsByKeysQuery(SITE_SETTING_KEYS);
    const data = mapRecordsToSiteSettings(records);
    await writeSiteSettingsCache(data);

    return {
      success: true,
      type: "success",
      message: "사이트 기본정보를 불러왔습니다.",
      data,
    };
  } catch (error) {
    console.error("getSiteSettingsAdminAction Error:", error);
    return { success: false, type: "error", message: "사이트 기본정보를 불러오지 못했습니다." };
  }
};

export const getPublicSiteSettingsAction = async (): Promise<ActionState<SiteSettingsData>> => {
  try {
    const records = await getSettingsByKeysQuery(SITE_SETTING_KEYS);

    return {
      success: true,
      type: "success",
      message: "사이트 기본정보를 불러왔습니다.",
      data: mapRecordsToSiteSettings(records),
    };
  } catch (error) {
    console.error("getPublicSiteSettingsAction Error:", error);
    return {
      success: true,
      type: "success",
      message: "기본 사이트 설정을 사용합니다.",
      data: mapRecordsToSiteSettings([]),
    };
  }
};

export const getPublicSiteUrlAction = async (): Promise<ActionState<{ siteUrl: string }>> => {
  try {
    const records = await getSettingsByKeysQuery([SITE_SETTING_META.siteUrl.key]);
    const siteUrl = records.find((record) => record.key === SITE_SETTING_META.siteUrl.key)?.value?.trim() || "";

    return {
      success: true,
      type: "success",
      message: "사이트 대표 URL을 불러왔습니다.",
      data: { siteUrl },
    };
  } catch (error) {
    console.error("getPublicSiteUrlAction Error:", error);
    return {
      success: false,
      type: "error",
      message: "사이트 대표 URL을 불러오지 못했습니다.",
      data: { siteUrl: "" },
    };
  }
};

export const getUploadSettingsAdminAction = async (): Promise<ActionState<UploadSettingsData>> => {
  const sessionInfo = await getUserSessionAction();

  if (!sessionInfo?.data?.isAdmin) {
    return { success: false, type: "error", message: "관리자 권한이 필요합니다." };
  }

  try {
    const cached = await readUploadSettingsCache();
    if (cached) {
      return {
        success: true,
        type: "success",
        message: "업로드 설정을 불러왔습니다.",
        data: cached,
      };
    }

    const records = await getSettingsByKeysQuery(UPLOAD_SETTING_KEYS);
    const data = mapRecordsToUploadSettings(records);
    await writeUploadSettingsCache(data);

    return {
      success: true,
      type: "success",
      message: "업로드 설정을 불러왔습니다.",
      data,
    };
  } catch (error) {
    console.error("getUploadSettingsAdminAction Error:", error);
    return { success: false, type: "error", message: "업로드 설정을 불러오지 못했습니다." };
  }
};

export const getAuthSettingsAdminAction = async (): Promise<ActionState<AuthSettingsData>> => {
  const sessionInfo = await getUserSessionAction();

  if (!sessionInfo?.data?.isAdmin) {
    return { success: false, type: "error", message: "관리자 권한이 필요합니다." };
  }

  try {
    const cached = await readAuthSettingsCache();
    if (cached) {
      return {
        success: true,
        type: "success",
        message: "회원/인증 설정을 불러왔습니다.",
        data: cached,
      };
    }

    const records = await getSettingsByKeysQuery(AUTH_SETTING_KEYS);
    const data = mapRecordsToAuthSettings(records);
    await writeAuthSettingsCache(data);

    return {
      success: true,
      type: "success",
      message: "회원/인증 설정을 불러왔습니다.",
      data,
    };
  } catch (error) {
    console.error("getAuthSettingsAdminAction Error:", error);
    return { success: false, type: "error", message: "회원/인증 설정을 불러오지 못했습니다." };
  }
};

export const getSeoSettingsAdminAction = async (): Promise<ActionState<SeoSettingsData>> => {
  const sessionInfo = await getUserSessionAction();

  if (!sessionInfo?.data?.isAdmin) {
    return { success: false, type: "error", message: "관리자 권한이 필요합니다." };
  }

  try {
    const cached = await readSeoSettingsCache();
    if (cached) {
      return {
        success: true,
        type: "success",
        message: "SEO 설정을 불러왔습니다.",
        data: cached,
      };
    }

    const records = await getSettingsByKeysQuery(SEO_SETTING_KEYS);
    const data = mapRecordsToSeoSettings(records);
    await writeSeoSettingsCache(data);

    return {
      success: true,
      type: "success",
      message: "SEO 설정을 불러왔습니다.",
      data,
    };
  } catch (error) {
    console.error("getSeoSettingsAdminAction Error:", error);
    return { success: false, type: "error", message: "SEO 설정을 불러오지 못했습니다." };
  }
};

export const getNotificationSettingsAdminAction = async (): Promise<ActionState<NotificationSettingsData>> => {
  const sessionInfo = await getUserSessionAction();

  if (!sessionInfo?.data?.isAdmin) {
    return { success: false, type: "error", message: "관리자 권한이 필요합니다." };
  }

  try {
    const cached = await readNotificationSettingsCache();
    if (cached) {
      return {
        success: true,
        type: "success",
        message: "알림 설정을 불러왔습니다.",
        data: cached,
      };
    }

    const records = await getSettingsByKeysQuery(NOTIFICATION_SETTING_KEYS);
    const data = mapRecordsToNotificationSettings(records);
    await writeNotificationSettingsCache(data);

    return {
      success: true,
      type: "success",
      message: "알림 설정을 불러왔습니다.",
      data,
    };
  } catch (error) {
    console.error("getNotificationSettingsAdminAction Error:", error);
    return { success: false, type: "error", message: "알림 설정을 불러오지 못했습니다." };
  }
};

export const getUploadSettingsRuntimeAction = async (): Promise<UploadSettingsData> => {
  const cached = await readUploadSettingsCache();
  if (cached) return cached;

  const records = await getSettingsByKeysQuery(UPLOAD_SETTING_KEYS);
  const data = mapRecordsToUploadSettings(records);
  await writeUploadSettingsCache(data);

  return data;
};

export const getSeoSettingsRuntimeAction = async (): Promise<SeoSettingsData> => {
  const cached = await readSeoSettingsCache();
  if (cached) return cached;

  try {
    const records = await getSettingsByKeysQuery(SEO_SETTING_KEYS);
    const data = mapRecordsToSeoSettings(records);
    await writeSeoSettingsCache(data);

    return data;
  } catch (error) {
    console.error("getSeoSettingsRuntimeAction Error:", error);
    return mapRecordsToSeoSettings([]);
  }
};

export const getNotificationSettingsRuntimeAction = async (): Promise<NotificationSettingsData> => {
  const cached = await readNotificationSettingsCache();
  if (cached) return cached;

  try {
    const records = await getSettingsByKeysQuery(NOTIFICATION_SETTING_KEYS);
    const data = mapRecordsToNotificationSettings(records);
    await writeNotificationSettingsCache(data);

    return data;
  } catch (error) {
    console.error("getNotificationSettingsRuntimeAction Error:", error);
    return mapRecordsToNotificationSettings([]);
  }
};

export const getPublicSitemapEntriesAction = async () => {
  try {
    const [seoSettings, siteSettings] = await Promise.all([
      getSeoSettingsRuntimeAction(),
      getPublicSiteSettingsAction(),
    ]);

    if (!seoSettings.sitemapEnabled) {
      return {
        success: true,
        type: "success",
        message: "사이트맵이 비활성화되어 있습니다.",
        data: { siteUrl: siteSettings.data?.siteUrl || "http://localhost:3000", entries: [] },
      };
    }

    const [pageEntries, postEntries] = await Promise.all([
      seoSettings.includePagesInSitemap ? getPublicPageSitemapEntriesQuery() : Promise.resolve([]),
      seoSettings.includePostsInSitemap ? getPublicPostSitemapEntriesQuery() : Promise.resolve([]),
    ]);

    const entries = [...pageEntries, ...postEntries];
    const uniqueEntries = Array.from(new Map(entries.map((entry) => [entry.url, entry])).values());

    return {
      success: true,
      type: "success",
      message: "사이트맵 데이터를 불러왔습니다.",
      data: {
        siteUrl: siteSettings.data?.siteUrl || "http://localhost:3000",
        entries: uniqueEntries,
      },
    };
  } catch (error) {
    console.error("getPublicSitemapEntriesAction Error:", error);
    return {
      success: true,
      type: "success",
      message: "사이트맵 기본값을 사용합니다.",
      data: { siteUrl: "http://localhost:3000", entries: [] },
    };
  }
};

export const updateSiteSettingsAdminAction = async (formData: FormData): Promise<ActionState<SiteSettingsData>> => {
  const sessionInfo = await getUserSessionAction();

  if (!sessionInfo?.data?.isAdmin) {
    return { success: false, type: "error", message: "관리자 권한이 필요합니다." };
  }

  const formPayload = {
    appName: formData.get("appName"),
    projectName: formData.get("projectName"),
    projectTitle: formData.get("projectTitle"),
    siteUrl: formData.get("siteUrl"),
    apiBaseUrl: formData.get("apiBaseUrl"),
    logoPath: formData.get("logoPath"),
    faviconPath: formData.get("faviconPath"),
    defaultOgImage: formData.get("defaultOgImage"),
    adminLayout: formData.get("adminLayout"),
    userLayout: formData.get("userLayout"),
  };

  const validation = validateForm(SiteSettingsSchema, formPayload);
  if (!validation.isValid) return validation.errorResponse;

  try {
    const nextSettings = { ...validation.data };
    const uploadFields = [
      { formName: "logoFile", dataKey: "logoPath", label: "로고 이미지" },
      { formName: "faviconFile", dataKey: "faviconPath", label: "파비콘" },
      { formName: "defaultOgImageFile", dataKey: "defaultOgImage", label: "기본 OG 이미지" },
    ] as const;

    for (const field of uploadFields) {
      const file = formData.get(field.formName);
      if (!isFileLike(file) || file.size === 0) continue;

      const savedPath = await saveSiteImage(file, field.label);
      if (savedPath) nextSettings[field.dataKey] = savedPath;
    }

    await upsertSettingsQuery(toSettingSeeds(nextSettings));
    await writeSiteSettingsCache(nextSettings);
    const cookieStore = await cookies();
    cookieStore.set("pending-admin-layout", nextSettings.adminLayout, {
      path: "/admin",
      maxAge: 60,
      sameSite: "lax",
    });
    revalidatePath("/admin", "layout");
    revalidatePath("/admin");
    revalidatePath("/admin/settings");

    return {
      success: true,
      type: "success",
      message: "사이트 기본정보가 저장되었습니다.",
      data: nextSettings,
    };
  } catch (error) {
    console.error("updateSiteSettingsAdminAction Error:", error);
    return {
      success: false,
      type: "error",
      message: error instanceof Error ? error.message : "사이트 기본정보 저장에 실패했습니다.",
    };
  }
};

export const updateSeoSettingsAdminAction = async (formData: FormData): Promise<ActionState<SeoSettingsData>> => {
  const sessionInfo = await getUserSessionAction();

  if (!sessionInfo?.data?.isAdmin) {
    return { success: false, type: "error", message: "관리자 권한이 필요합니다." };
  }

  const formPayload = {
    defaultTitle: formData.get("defaultTitle"),
    titleTemplate: formData.get("titleTemplate"),
    metaDescription: formData.get("metaDescription"),
    keywords: formData.get("keywords"),
    robotsIndex: formData.get("robotsIndex"),
    robotsFollow: formData.get("robotsFollow"),
    twitterCard: formData.get("twitterCard"),
    sitemapEnabled: formData.has("sitemapEnabled"),
    includePagesInSitemap: formData.has("includePagesInSitemap"),
    includePostsInSitemap: formData.has("includePostsInSitemap"),
  };

  const validation = validateForm(SeoSettingsSchema, formPayload);
  if (!validation.isValid) return validation.errorResponse;

  try {
    await upsertSettingsQuery(toSeoSettingSeeds(validation.data));
    await writeSeoSettingsCache(validation.data);

    return {
      success: true,
      type: "success",
      message: "SEO 설정이 저장되었습니다.",
      data: validation.data,
    };
  } catch (error) {
    console.error("updateSeoSettingsAdminAction Error:", error);
    return { success: false, type: "error", message: "SEO 설정 저장에 실패했습니다." };
  }
};

export const updateNotificationSettingsAdminAction = async (formData: FormData): Promise<ActionState<NotificationSettingsData>> => {
  const sessionInfo = await getUserSessionAction();

  if (!sessionInfo?.data?.isAdmin) {
    return { success: false, type: "error", message: "관리자 권한이 필요합니다." };
  }

  const formPayload = {
    commentNotificationsEnabled: formData.has("commentNotificationsEnabled"),
    replyNotificationsEnabled: formData.has("replyNotificationsEnabled"),
    adminContentNotificationsEnabled: formData.has("adminContentNotificationsEnabled"),
    forceLogoutNotificationsEnabled: formData.has("forceLogoutNotificationsEnabled"),
    pwaEnabled: formData.has("pwaEnabled"),
    webPushEnabled: formData.has("webPushEnabled"),
    fcmPushEnabled: formData.has("fcmPushEnabled"),
    excludeSelfNotifications: formData.has("excludeSelfNotifications"),
    realtimeNotificationsEnabled: formData.has("realtimeNotificationsEnabled"),
    toastNotificationsEnabled: formData.has("toastNotificationsEnabled"),
    showNotificationThumbnails: formData.has("showNotificationThumbnails"),
    unreadPreviewLimit: formData.get("unreadPreviewLimit"),
    historyPageSize: formData.get("historyPageSize"),
    retentionDays: formData.get("retentionDays"),
  };

  const validation = validateForm(NotificationSettingsSchema, formPayload);
  if (!validation.isValid) return validation.errorResponse;

  try {
    await upsertSettingsQuery(toNotificationSettingSeeds(validation.data));
    await writeNotificationSettingsCache(validation.data);

    return {
      success: true,
      type: "success",
      message: "알림 설정이 저장되었습니다.",
      data: validation.data,
    };
  } catch (error) {
    console.error("updateNotificationSettingsAdminAction Error:", error);
    return { success: false, type: "error", message: "알림 설정 저장에 실패했습니다." };
  }
};

export const updateUploadSettingsAdminAction = async (formData: FormData): Promise<ActionState<UploadSettingsData>> => {
  const sessionInfo = await getUserSessionAction();

  if (!sessionInfo?.data?.isAdmin) {
    return { success: false, type: "error", message: "관리자 권한이 필요합니다." };
  }

  const formPayload = {
    maxUploadSizeMb: formData.get("maxUploadSizeMb"),
    userStorageLimitMb: formData.get("userStorageLimitMb"),
    maxImageWidth: formData.get("maxImageWidth"),
    maxImageHeight: formData.get("maxImageHeight"),
    imageQuality: formData.get("imageQuality"),
    imageOutputFormat: formData.get("imageOutputFormat"),
    allowedExtensions: formData.get("allowedExtensions"),
    enableImageProcessing: formData.has("enableImageProcessing"),
    stripImageMetadata: formData.has("stripImageMetadata"),
    verifyMimeType: formData.has("verifyMimeType"),
    restrictProfileImage: formData.has("restrictProfileImage"),
    allowVideo: formData.has("allowVideo"),
    allowArchive: formData.has("allowArchive"),
  };

  const validation = validateForm(UploadSettingsSchema, formPayload);
  if (!validation.isValid) return validation.errorResponse;

  try {
    await upsertSettingsQuery(toUploadSettingSeeds(validation.data));
    await writeUploadSettingsCache(validation.data);

    return {
      success: true,
      type: "success",
      message: "업로드 설정이 저장되었습니다.",
      data: validation.data,
    };
  } catch (error) {
    console.error("updateUploadSettingsAdminAction Error:", error);
    return { success: false, type: "error", message: "업로드 설정 저장에 실패했습니다." };
  }
};

export const updateAuthSettingsAdminAction = async (formData: FormData): Promise<ActionState<AuthSettingsData>> => {
  const sessionInfo = await getUserSessionAction();

  if (!sessionInfo?.data?.isAdmin) {
    return { success: false, type: "error", message: "관리자 권한이 필요합니다." };
  }

  const formPayload = {
    registrationEnabled: formData.has("registrationEnabled"),
    accountDeletionEnabled: formData.has("accountDeletionEnabled"),
    defaultUserStatus: formData.get("defaultUserStatus"),
    minPasswordLength: formData.get("minPasswordLength"),
    requirePasswordNumber: formData.has("requirePasswordNumber"),
    requirePasswordLetter: formData.has("requirePasswordLetter"),
    requirePasswordSpecial: formData.has("requirePasswordSpecial"),
    loginFailLimit: formData.get("loginFailLimit"),
    loginFailWindowMinutes: formData.get("loginFailWindowMinutes"),
    loginLockMinutes: formData.get("loginLockMinutes"),
    accessTokenExpiresIn: formData.get("accessTokenExpiresIn"),
    refreshTokenExpiresIn: formData.get("refreshTokenExpiresIn"),
    allowConcurrentSessions: formData.has("allowConcurrentSessions"),
    adminSessionGuard: formData.has("adminSessionGuard"),
  };

  const validation = validateForm(AuthSettingsSchema, formPayload);
  if (!validation.isValid) return validation.errorResponse;

  try {
    await upsertSettingsQuery(toAuthSettingSeeds(validation.data));
    await writeAuthSettingsCache(validation.data);

    return {
      success: true,
      type: "success",
      message: "회원/인증 설정이 저장되었습니다.",
      data: validation.data,
    };
  } catch (error) {
    console.error("updateAuthSettingsAdminAction Error:", error);
    return { success: false, type: "error", message: "회원/인증 설정 저장에 실패했습니다." };
  }
};
