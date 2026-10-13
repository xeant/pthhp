import { z } from "zod";
import { ActionResponse } from "@/core/types/actions";

export type { ActionResponse };

export type ActionState<T = any> = ActionResponse<T>;

export const SiteSettingsSchema = z.object({
  appName: z.string().trim().min(1, "APP_NAME을 입력해주세요.").max(80, "APP_NAME은 80자 이하로 입력해주세요."),
  projectName: z.string().trim().min(1, "PROJECT_NAME을 입력해주세요.").max(80, "PROJECT_NAME은 80자 이하로 입력해주세요."),
  projectTitle: z.string().trim().min(1, "PROJECT_TITLE을 입력해주세요.").max(120, "PROJECT_TITLE은 120자 이하로 입력해주세요."),
  siteUrl: z.string().trim().url("사이트 URL 형식이 올바르지 않습니다."),
  apiBaseUrl: z.string().trim().url("API Base URL 형식이 올바르지 않습니다.").optional().or(z.literal("")),
  logoPath: z.string().trim().max(500, "로고 이미지 경로가 너무 깁니다.").optional().or(z.literal("")),
  faviconPath: z.string().trim().max(500, "파비콘 경로가 너무 깁니다.").optional().or(z.literal("")),
  defaultOgImage: z.string().trim().max(500, "기본 OG 이미지 경로가 너무 깁니다.").optional().or(z.literal("")),
  adminLayout: z.string().trim().min(1, "관리자 레이아웃을 선택해주세요.").max(80, "관리자 레이아웃 키가 너무 깁니다."),
  userLayout: z.string().trim().min(1, "사용자 레이아웃을 선택해주세요.").max(80, "사용자 레이아웃 키가 너무 깁니다."),
});

export type SiteSettingsParams = z.infer<typeof SiteSettingsSchema>;

export type SiteSettingsData = SiteSettingsParams;

export const SeoSettingsSchema = z.object({
  defaultTitle: z.string().trim().min(1, "기본 메타 제목을 입력해주세요.").max(120, "기본 메타 제목은 120자 이하로 입력해주세요."),
  titleTemplate: z.string().trim().min(1, "타이틀 규칙을 입력해주세요.").max(120, "타이틀 규칙은 120자 이하로 입력해주세요."),
  metaDescription: z.string().trim().min(1, "기본 메타 설명을 입력해주세요.").max(300, "기본 메타 설명은 300자 이하로 입력해주세요."),
  keywords: z.string().trim().max(300, "키워드는 300자 이하로 입력해주세요.").optional().or(z.literal("")),
  robotsIndex: z.enum(["index", "noindex"], {
    error: "색인 정책을 선택해주세요.",
  }),
  robotsFollow: z.enum(["follow", "nofollow"], {
    error: "링크 추적 정책을 선택해주세요.",
  }),
  twitterCard: z.enum(["summary", "summary_large_image"], {
    error: "Twitter 카드 타입을 선택해주세요.",
  }),
  sitemapEnabled: z.boolean(),
  includePagesInSitemap: z.boolean(),
  includePostsInSitemap: z.boolean(),
});

export type SeoSettingsParams = z.infer<typeof SeoSettingsSchema>;

export type SeoSettingsData = SeoSettingsParams;

export const NotificationSettingsSchema = z.object({
  commentNotificationsEnabled: z.boolean(),
  replyNotificationsEnabled: z.boolean(),
  adminContentNotificationsEnabled: z.boolean(),
  forceLogoutNotificationsEnabled: z.boolean(),
  pwaEnabled: z.boolean(),
  webPushEnabled: z.boolean(),
  fcmPushEnabled: z.boolean(),
  excludeSelfNotifications: z.boolean(),
  realtimeNotificationsEnabled: z.boolean(),
  toastNotificationsEnabled: z.boolean(),
  showNotificationThumbnails: z.boolean(),
  unreadPreviewLimit: z.coerce.number().int().min(1, "메뉴 미리보기는 1개 이상이어야 합니다.").max(50, "메뉴 미리보기는 50개 이하로 입력해주세요."),
  historyPageSize: z.coerce.number().int().min(5, "히스토리 페이지는 5개 이상이어야 합니다.").max(100, "히스토리 페이지는 100개 이하로 입력해주세요."),
  retentionDays: z.coerce.number().int().min(1, "보관 기간은 1일 이상이어야 합니다.").max(3650, "보관 기간이 너무 깁니다."),
});

export type NotificationSettingsParams = z.infer<typeof NotificationSettingsSchema>;

export type NotificationSettingsData = NotificationSettingsParams;

export const UploadSettingsSchema = z.object({
  maxUploadSizeMb: z.coerce.number().int().min(1, "파일당 용량은 1MB 이상이어야 합니다.").max(500, "파일당 용량은 500MB 이하로 입력해주세요."),
  userStorageLimitMb: z.coerce.number().int().min(1, "사용자별 용량은 1MB 이상이어야 합니다.").max(102400, "사용자별 용량이 너무 큽니다."),
  maxImageWidth: z.coerce.number().int().min(320, "이미지 최대 너비는 320px 이상이어야 합니다.").max(10000, "이미지 최대 너비가 너무 큽니다."),
  maxImageHeight: z.coerce.number().int().min(320, "이미지 최대 높이는 320px 이상이어야 합니다.").max(10000, "이미지 최대 높이가 너무 큽니다."),
  imageQuality: z.coerce.number().int().min(1, "이미지 품질은 1 이상이어야 합니다.").max(100, "이미지 품질은 100 이하로 입력해주세요."),
  imageOutputFormat: z.enum(["original", "webp", "jpeg", "png", "avif"], {
    error: "이미지 출력 포맷을 선택해주세요.",
  }),
  allowedExtensions: z.string().trim().min(1, "허용 확장자를 입력해주세요.").max(500, "허용 확장자 목록이 너무 깁니다."),
  enableImageProcessing: z.boolean(),
  stripImageMetadata: z.boolean(),
  verifyMimeType: z.boolean(),
  restrictProfileImage: z.boolean(),
  allowVideo: z.boolean(),
  allowArchive: z.boolean(),
});

export type UploadSettingsParams = z.infer<typeof UploadSettingsSchema>;

export type UploadSettingsData = UploadSettingsParams;

const expiresInRule = z
  .string()
  .trim()
  .regex(/^\d+[smhd]$/, "시간 형식은 15m, 1h, 7d처럼 입력해주세요.");

export const AuthSettingsSchema = z.object({
  registrationEnabled: z.boolean(),
  accountDeletionEnabled: z.boolean(),
  defaultUserStatus: z.enum(["active", "pending", "blocked"], {
    error: "가입 후 상태를 선택해주세요.",
  }),
  minPasswordLength: z.coerce.number().int().min(8, "비밀번호는 최소 8자 이상이어야 합니다.").max(128, "비밀번호 최소 길이가 너무 큽니다."),
  requirePasswordNumber: z.boolean(),
  requirePasswordLetter: z.boolean(),
  requirePasswordSpecial: z.boolean(),
  loginFailLimit: z.coerce.number().int().min(1, "실패 허용 횟수는 1 이상이어야 합니다.").max(30, "실패 허용 횟수가 너무 큽니다."),
  loginFailWindowMinutes: z.coerce.number().int().min(1, "실패 카운트 유지 시간은 1분 이상이어야 합니다.").max(1440, "실패 카운트 유지 시간이 너무 깁니다."),
  loginLockMinutes: z.coerce.number().int().min(1, "잠금 시간은 1분 이상이어야 합니다.").max(1440, "잠금 시간이 너무 깁니다."),
  accessTokenExpiresIn: expiresInRule,
  refreshTokenExpiresIn: expiresInRule,
  allowConcurrentSessions: z.boolean(),
  adminSessionGuard: z.boolean(),
});

export type AuthSettingsParams = z.infer<typeof AuthSettingsSchema>;

export type AuthSettingsData = AuthSettingsParams;

export const SiteNavigationSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  groupId: z.coerce.number().int().positive().optional(),
  groupKey: z.string().trim().min(1, "메뉴 그룹을 선택해주세요.").max(100, "메뉴 그룹 키는 100자 이하로 입력해주세요."),
  parentId: z.coerce.number().int().positive().nullable().optional(),
  name: z.string().trim().min(1, "메뉴 키를 입력해주세요.").max(100, "메뉴 키는 100자 이하로 입력해주세요."),
  title: z.string().trim().min(1, "메뉴 이름을 입력해주세요.").max(120, "메뉴 이름은 120자 이하로 입력해주세요."),
  href: z.string().trim().min(1, "링크 주소를 입력해주세요.").max(500, "링크 주소가 너무 깁니다."),
  target: z.string().trim().max(20, "타겟은 20자 이하로 입력해주세요.").optional().or(z.literal("")),
  icon: z.string().trim().max(60, "아이콘 이름은 60자 이하로 입력해주세요.").optional().or(z.literal("")),
  order: z.coerce.number().int().min(0, "정렬값은 0 이상이어야 합니다.").default(0),
  location: z.string().trim().min(1, "노출 위치를 선택해주세요.").max(45, "노출 위치는 45자 이하로 입력해주세요."),
  visibility: z.string().trim().min(1, "공개 범위를 선택해주세요.").max(45, "공개 범위는 45자 이하로 입력해주세요."),
  isActive: z.coerce.boolean().default(false),
});

export type SiteNavigationParams = z.infer<typeof SiteNavigationSchema>;

export const SiteNavigationGroupSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  key: z.string().trim().min(1, "그룹 키를 입력해주세요.").max(100, "그룹 키는 100자 이하로 입력해주세요."),
  title: z.string().trim().min(1, "그룹 이름을 입력해주세요.").max(120, "그룹 이름은 120자 이하로 입력해주세요."),
  description: z.string().trim().max(500, "설명은 500자 이하로 입력해주세요.").optional().or(z.literal("")),
  area: z.string().trim().min(1, "영역을 선택해주세요.").max(45, "영역은 45자 이하로 입력해주세요."),
  order: z.coerce.number().int().min(0, "정렬값은 0 이상이어야 합니다.").default(0),
  isActive: z.coerce.boolean().default(false),
});

export type SiteNavigationGroupParams = z.infer<typeof SiteNavigationGroupSchema>;

export interface SiteNavigationGroupItem {
  id: number;
  key: string;
  title: string;
  description: string | null;
  area: string;
  order: number;
  isActive: boolean;
}

export interface SiteNavigationItem {
  id: number;
  groupId: number | null;
  groupKey: string;
  groupTitle: string;
  groupArea: string;
  parentId: number | null;
  name: string;
  title: string;
  href: string;
  target: string | null;
  icon: string | null;
  order: number;
  depth: number;
  location: string;
  visibility: string;
  isActive: boolean;
  children: SiteNavigationItem[];
}

export interface SiteNavigationAdminData {
  groups: SiteNavigationGroupItem[];
  items: SiteNavigationItem[];
}
