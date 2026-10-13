"use client";

import React, { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Globe2,
  Image,
  LockKeyhole,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
  Upload,
  UserRound,
} from "lucide-react";

import { AuthSettingsData, NotificationSettingsData, SeoSettingsData, SiteSettingsData, UploadSettingsData } from "@/modules/admin/actions/_type";
import { updateAuthSettingsAdminAction, updateNotificationSettingsAdminAction, updateSeoSettingsAdminAction, updateSiteSettingsAdminAction, updateUploadSettingsAdminAction } from "@/modules/admin/actions/settings.action";
import Button from "@components/button/Button";
import InputField from "@components/form/InputField";

type SettingsSection = "site" | "seo" | "auth" | "upload" | "notification";

type SettingsProps = {
  section?: SettingsSection;
  initialSiteSettings?: SiteSettingsData;
  initialUploadSettings?: UploadSettingsData;
  initialAuthSettings?: AuthSettingsData;
  initialSeoSettings?: SeoSettingsData;
  initialNotificationSettings?: NotificationSettingsData;
  adminLayoutOptions?: RegistryOption[];
  userLayoutOptions?: RegistryOption[];
};

type RegistryOption = {
  key: string;
  label: string;
  description: string;
};

type PwaRuntimeStatus = {
  pwa: {
    enabled: boolean;
    manifest: boolean;
    serviceWorker: boolean;
    icons: boolean;
    secureContext: boolean;
  };
  webPush: {
    enabled: boolean;
    configured: boolean;
    publicKey: boolean;
    privateKey: boolean;
    subject: string;
    activeSubscriptions: number;
  };
  fcmPush: {
    enabled: boolean;
    projectId: boolean;
    credentials: boolean;
  };
};

type BrowserPushState = {
  checked: boolean;
  serviceWorker: boolean;
  pushManager: boolean;
  notification: boolean;
  badge: boolean;
  permission: NotificationPermission | "unsupported";
  subscribed: boolean;
};

const sectionMeta: Record<SettingsSection, {
  label: string;
  eyebrow: string;
  description: string;
}> = {
  site: {
    label: "사이트 기본정보",
    eyebrow: "General",
    description: "서비스 이름, 대표 이미지, 기본 언어를 정리합니다.",
  },
  seo: {
    label: "SEO 기본설정",
    eyebrow: "Discovery",
    description: "검색 노출과 공유 메타 정보의 기본값입니다.",
  },
  auth: {
    label: "회원/인증 설정",
    eyebrow: "Account",
    description: "가입, 계정 상태, 세션 정책을 관리합니다.",
  },
  upload: {
    label: "업로드 설정",
    eyebrow: "Storage",
    description: "첨부파일 용량, 확장자, 검증 기준을 관리합니다.",
  },
  notification: {
    label: "알림 설정",
    eyebrow: "Signal",
    description: "댓글, 답글, 실시간 알림의 기본 정책입니다.",
  },
};

const selectClass =
  "w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition-colors hover:border-gray-300 focus:border-gray-400 dark:border-dark-700 dark:bg-dark-900 dark:text-dark-100 dark:hover:border-dark-600";

const textareaClass =
  "w-full resize-y rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm leading-6 text-gray-700 outline-none transition-colors placeholder:text-gray-400 hover:border-gray-300 focus:border-gray-400 dark:border-dark-700 dark:bg-dark-900 dark:text-dark-100 dark:placeholder:text-dark-500";

const urlBase64ToUint8Array = (value: string) => {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);

  for (let index = 0; index < raw.length; index += 1) {
    output[index] = raw.charCodeAt(index);
  }

  return output;
};

const StatusPill = ({ ok, label }: { ok: boolean; label: string }) => {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${ok ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-gray-100 text-gray-500 dark:bg-dark-800 dark:text-dark-400"}`}>
      {label}
    </span>
  );
};

const SectionShell = ({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) => {
  return (
    <section className="grid grid-cols-4 gap-8 border-t border-gray-200 py-10 first:border-t-0 dark:border-dark-800">
      <div className="col-span-4 lg:col-span-1">
        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-400">
          {icon}
          Settings
        </div>
        <div className="mt-3 text-lg font-semibold text-gray-600 dark:text-dark-100">{title}</div>
        {description && <div className="mt-2 text-sm leading-6 text-gray-400">{description}</div>}
      </div>
      <div className="col-span-4 lg:col-span-3">
        <div className="grid gap-4">{children}</div>
      </div>
    </section>
  );
};

const FieldRow = ({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="rounded-md p-5 transition-colors hover:bg-gray-50 dark:hover:bg-dark-900">
      <div className="mb-4">
        <div className="text-sm font-medium text-black dark:text-dark-100">{label}</div>
        {description && <div className="mt-1 text-xs leading-5 text-gray-400">{description}</div>}
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
};

const InlineField = ({
  title,
  description,
  settingKey,
  children,
}: {
  title: string;
  description: string;
  settingKey?: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="rounded-md p-5 transition-colors hover:bg-gray-50 dark:hover:bg-dark-900">
      <div className="mb-3 min-h-[58px]">
        <div className="text-xs font-semibold text-gray-700 dark:text-dark-100">{title}</div>
        <div className="mt-1 text-xs leading-5 text-gray-400">{description}</div>
        {settingKey && (
          <div className="mt-2 inline-flex rounded bg-gray-100 px-2 py-0.5 font-mono text-[10px] font-medium text-gray-400 dark:bg-dark-800">
            {settingKey}
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

const Toggle = ({
  name,
  checked,
  defaultChecked = false,
  onChange,
}: {
  name?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = typeof checked === "boolean";
  const active = isControlled ? checked : internalChecked;
  const handleClick = () => {
    const next = !active;
    if (!isControlled) setInternalChecked(next);
    onChange?.(next);
  };

  return (
    <>
      {name && active && <input type="hidden" name={name} value="true" />}
      <button
        type="button"
        onClick={handleClick}
        className="relative block h-6 w-11 min-w-11 shrink-0 cursor-pointer rounded-full bg-gray-200 transition-colors data-[checked=true]:bg-cyan-500 dark:bg-dark-700 dark:data-[checked=true]:bg-cyan-500"
        data-checked={active}
        aria-pressed={active}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
            active ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </>
  );
};

const SiteImageUploadField = ({
  title,
  description,
  recommendedSize,
  currentPath,
  pathName,
  fileName,
  variant = "wide",
}: {
  title: string;
  description: string;
  recommendedSize: string;
  currentPath?: string;
  pathName: keyof SiteSettingsData;
  fileName: string;
  variant?: "logo" | "favicon" | "wide";
}) => {
  const inputId = `site-${fileName}`;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const displayUrl = previewUrl || currentPath || "";
  const isFavicon = variant === "favicon";
  const previewWrapClass = isFavicon
    ? "mb-4 flex h-[148px] items-center justify-center rounded-md border border-dashed border-gray-200 bg-gray-50 dark:border-dark-700 dark:bg-dark-950"
    : variant === "logo"
      ? "mb-4 grid h-[148px] place-items-center overflow-hidden rounded-md border border-dashed border-gray-200 bg-gray-50 dark:border-dark-700 dark:bg-dark-950"
      : "mb-4 grid aspect-[1.91/1] min-h-[148px] place-items-center overflow-hidden rounded-md border border-dashed border-gray-200 bg-gray-50 dark:border-dark-700 dark:bg-dark-950";
  const imageClass = isFavicon ? "h-16 w-16 object-contain" : "h-full w-full object-contain";

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  return (
    <div className="flex h-full min-h-[356px] flex-col rounded-md border border-gray-100 bg-white p-4 transition-colors hover:border-gray-200 dark:border-dark-800 dark:bg-dark-900">
      <input type="hidden" name={pathName} value={currentPath || ""} />
      <div className={previewWrapClass}>
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={displayUrl} alt={title} className={imageClass} />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-300">
            <Image size={22} strokeWidth={1.5} />
            <span className="text-xs font-medium">이미지 없음</span>
          </div>
        )}
      </div>
      <div className="mb-3">
        <div className="text-sm font-semibold text-gray-800 dark:text-dark-100">{title}</div>
        <div className="mt-1 text-xs leading-5 text-gray-400">{description}</div>
        <div className="mt-2 inline-flex rounded bg-gray-100 px-2 py-1 font-mono text-[10px] font-semibold text-gray-500 dark:bg-dark-800">
          {recommendedSize}
        </div>
        {currentPath && <div className="mt-2 truncate font-mono text-[10px] text-gray-400">{currentPath}</div>}
      </div>
      <label
        htmlFor={inputId}
        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-gray-950 px-3 text-xs font-bold text-white transition-colors hover:bg-blue-500"
      >
        <Upload size={13} />
        파일 선택
      </label>
      <input
        id={inputId}
        name={fileName}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/avif,image/webp,image/x-icon,image/vnd.microsoft.icon,.ico"
        onChange={handleFileChange}
        className="sr-only"
      />
    </div>
  );
};

const UploadNumberField = ({
  refObject,
  title,
  description,
  unit,
  name,
  value,
  onChange,
  error,
  placeholder,
}: {
  refObject?: React.Ref<HTMLInputElement>;
  title: string;
  description: string;
  unit: string;
  name: string;
  value: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder: string;
}) => {
  return (
    <div className="rounded-md border border-gray-100 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
      <div className="mb-3 min-h-[58px]">
        <div className="text-sm font-semibold text-gray-800 dark:text-dark-100">{title}</div>
        <div className="mt-1 text-xs leading-5 text-gray-400">{description}</div>
      </div>
      <div className="relative">
        <InputField
          ref={refObject}
          inputTitle={title}
          name={name}
          type="number"
          value={value}
          onChange={onChange}
          error={error}
          placeholder={placeholder}
          hideLabel
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-400">
          {unit}
        </span>
      </div>
    </div>
  );
};

const UploadTogglePolicy = ({
  title,
  description,
  name,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-gray-100 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-gray-800 dark:text-dark-100">{title}</div>
        <div className="mt-1 text-xs leading-5 text-gray-400">{description}</div>
      </div>
      <Toggle name={name} checked={checked} onChange={onChange} />
    </div>
  );
};

const defaultSiteSettings: SiteSettingsData = {
  appName: "plextype",
  projectName: "plextype",
  projectTitle: "plextype",
  siteUrl: "http://localhost:3000",
  apiBaseUrl: "",
  logoPath: "",
  faviconPath: "",
  defaultOgImage: "",
  adminLayout: "default",
  userLayout: "default",
};

const defaultAdminLayoutOptions: RegistryOption[] = [
  {
    key: "default",
    label: "기본 관리자",
    description: "Plextype 배포판에 포함되는 기본 관리자 화면입니다.",
  },
];

const defaultUserLayoutOptions: RegistryOption[] = [
  {
    key: "default",
    label: "기본 사용자",
    description: "Plextype 배포판에 포함되는 기본 사용자 화면입니다.",
  },
];

const defaultUploadSettings: UploadSettingsData = {
  maxUploadSizeMb: 20,
  userStorageLimitMb: 1024,
  maxImageWidth: 2560,
  maxImageHeight: 2560,
  imageQuality: 85,
  imageOutputFormat: "original",
  allowedExtensions: ".png, .jpg, .jpeg, .gif, .webp, .avif, .mp3, .ogg, .mp4, .webm, .mov, .zip",
  enableImageProcessing: true,
  stripImageMetadata: true,
  verifyMimeType: true,
  restrictProfileImage: true,
  allowVideo: true,
  allowArchive: true,
};

const defaultAuthSettings: AuthSettingsData = {
  registrationEnabled: true,
  accountDeletionEnabled: true,
  defaultUserStatus: "active",
  minPasswordLength: 8,
  requirePasswordNumber: false,
  requirePasswordLetter: false,
  requirePasswordSpecial: false,
  loginFailLimit: 5,
  loginFailWindowMinutes: 15,
  loginLockMinutes: 15,
  accessTokenExpiresIn: "1h",
  refreshTokenExpiresIn: "4h",
  allowConcurrentSessions: true,
  adminSessionGuard: true,
};

const defaultSeoSettings: SeoSettingsData = {
  defaultTitle: "Plextype",
  titleTemplate: "%s | Plextype",
  metaDescription: "Plextype으로 만든 사이트입니다.",
  keywords: "",
  robotsIndex: "index",
  robotsFollow: "follow",
  twitterCard: "summary_large_image",
  sitemapEnabled: true,
  includePagesInSitemap: true,
  includePostsInSitemap: true,
};

const defaultNotificationSettings: NotificationSettingsData = {
  commentNotificationsEnabled: true,
  replyNotificationsEnabled: true,
  adminContentNotificationsEnabled: true,
  forceLogoutNotificationsEnabled: true,
  pwaEnabled: true,
  webPushEnabled: true,
  fcmPushEnabled: true,
  excludeSelfNotifications: true,
  realtimeNotificationsEnabled: true,
  toastNotificationsEnabled: true,
  showNotificationThumbnails: true,
  unreadPreviewLimit: 20,
  historyPageSize: 20,
  retentionDays: 90,
};

const Settings = ({
  section = "site",
  initialSiteSettings = defaultSiteSettings,
  initialUploadSettings = defaultUploadSettings,
  initialAuthSettings = defaultAuthSettings,
  initialSeoSettings = defaultSeoSettings,
  initialNotificationSettings = defaultNotificationSettings,
  adminLayoutOptions = defaultAdminLayoutOptions,
  userLayoutOptions = defaultUserLayoutOptions,
}: SettingsProps) => {
  const router = useRouter();
  const activeSection = sectionMeta[section] ? section : "site";
  const meta = useMemo(() => sectionMeta[activeSection], [activeSection]);
  const [isPending, startTransition] = useTransition();
  const [siteSettings, setSiteSettings] = useState<SiteSettingsData>(initialSiteSettings);
  const [uploadSettings, setUploadSettings] = useState<UploadSettingsData>(initialUploadSettings);
  const [authSettings, setAuthSettings] = useState<AuthSettingsData>(initialAuthSettings);
  const [seoSettings, setSeoSettings] = useState<SeoSettingsData>(initialSeoSettings);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettingsData>(initialNotificationSettings);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);
  const [formMessage, setFormMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [pwaStatus, setPwaStatus] = useState<PwaRuntimeStatus | null>(null);
  const [pwaStatusLoading, setPwaStatusLoading] = useState(false);
  const [browserPushState, setBrowserPushState] = useState<BrowserPushState>({
    checked: false,
    serviceWorker: false,
    pushManager: false,
    notification: false,
    badge: false,
    permission: "unsupported",
    subscribed: false,
  });
  const appNameRef = useRef<HTMLInputElement>(null);
  const projectNameRef = useRef<HTMLInputElement>(null);
  const projectTitleRef = useRef<HTMLInputElement>(null);
  const siteUrlRef = useRef<HTMLInputElement>(null);
  const apiBaseUrlRef = useRef<HTMLInputElement>(null);
  const maxUploadSizeMbRef = useRef<HTMLInputElement>(null);
  const userStorageLimitMbRef = useRef<HTMLInputElement>(null);
  const maxImageWidthRef = useRef<HTMLInputElement>(null);
  const maxImageHeightRef = useRef<HTMLInputElement>(null);
  const imageQualityRef = useRef<HTMLInputElement>(null);
  const allowedExtensionsRef = useRef<HTMLTextAreaElement>(null);
  const minPasswordLengthRef = useRef<HTMLInputElement>(null);
  const loginFailLimitRef = useRef<HTMLInputElement>(null);
  const loginFailWindowMinutesRef = useRef<HTMLInputElement>(null);
  const loginLockMinutesRef = useRef<HTMLInputElement>(null);
  const accessTokenExpiresInRef = useRef<HTMLInputElement>(null);
  const refreshTokenExpiresInRef = useRef<HTMLInputElement>(null);
  const defaultTitleRef = useRef<HTMLInputElement>(null);
  const titleTemplateRef = useRef<HTMLInputElement>(null);
  const metaDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const keywordsRef = useRef<HTMLTextAreaElement>(null);
  const unreadPreviewLimitRef = useRef<HTMLInputElement>(null);
  const historyPageSizeRef = useRef<HTMLInputElement>(null);
  const retentionDaysRef = useRef<HTMLInputElement>(null);

  const refreshBrowserPushState = async () => {
    if (typeof window === "undefined" || typeof navigator === "undefined") return;

    const serviceWorker = "serviceWorker" in navigator;
    const pushManager = "PushManager" in window;
    const notification = "Notification" in window;
    const badge = "setAppBadge" in navigator || "clearAppBadge" in navigator;
    let subscribed = false;

    if (serviceWorker && pushManager) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        subscribed = Boolean(subscription);
      } catch {
        subscribed = false;
      }
    }

    setBrowserPushState({
      checked: true,
      serviceWorker,
      pushManager,
      notification,
      badge,
      permission: notification ? Notification.permission : "unsupported",
      subscribed,
    });
  };

  const refreshPwaStatus = async () => {
    setPwaStatusLoading(true);

    try {
      const response = await fetch("/api/admin/settings/notification/pwa-status", {
        credentials: "include",
        cache: "no-store",
      });
      const result = await response.json();

      if (result?.success) {
        setPwaStatus(result.status);
      }
    } catch (error) {
      console.error("PWA status load failed:", error);
    } finally {
      setPwaStatusLoading(false);
    }
  };

  const handleEnableWebPush = async () => {
    setFormMessage(null);

    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setFormMessage({ type: "error", message: "현재 브라우저는 Web Push를 지원하지 않습니다." });
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        await refreshBrowserPushState();
        setFormMessage({ type: "error", message: "브라우저 알림 권한이 허용되지 않았습니다." });
        return;
      }

      const keyResponse = await fetch("/api/web-push/vapid-public-key", {
        credentials: "include",
        cache: "no-store",
      });
      const keyResult = await keyResponse.json();

      if (!keyResponse.ok || !keyResult?.publicKey) {
        setFormMessage({ type: "error", message: keyResult?.message || "Web Push 공개 키가 설정되지 않았습니다." });
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const current = await registration.pushManager.getSubscription();
      const subscription = current || await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyResult.publicKey),
      });

      const saveResponse = await fetch("/api/web-push/subscriptions", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription.toJSON()),
      });
      const saveResult = await saveResponse.json();

      if (!saveResponse.ok || !saveResult?.success) {
        setFormMessage({ type: "error", message: saveResult?.message || "브라우저 푸시 구독 저장에 실패했습니다." });
        return;
      }

      await refreshBrowserPushState();
      await refreshPwaStatus();
      setFormMessage({ type: "success", message: "현재 브라우저의 Web Push 구독을 등록했습니다." });
    } catch (error) {
      console.error("Web Push enable failed:", error);
      setFormMessage({ type: "error", message: "Web Push 구독 등록 중 오류가 발생했습니다." });
    }
  };

  const handleDisableWebPush = async () => {
    setFormMessage(null);

    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        await refreshBrowserPushState();
        return;
      }

      await fetch("/api/web-push/subscriptions", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      await subscription.unsubscribe();

      await refreshBrowserPushState();
      await refreshPwaStatus();
      setFormMessage({ type: "success", message: "현재 브라우저의 Web Push 구독을 해제했습니다." });
    } catch (error) {
      console.error("Web Push disable failed:", error);
      setFormMessage({ type: "error", message: "Web Push 구독 해제 중 오류가 발생했습니다." });
    }
  };

  useEffect(() => {
    if (activeSection !== "notification") return;

    refreshPwaStatus();
    refreshBrowserPushState();
  }, [activeSection]);

  const handleSiteChange = (field: keyof SiteSettingsData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSiteSettings((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSiteSelectChange = (field: keyof SiteSettingsData) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSiteSettings((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleUploadInputChange = (field: keyof UploadSettingsData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setUploadSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUploadToggleChange = (field: keyof UploadSettingsData) => (checked: boolean) => {
    setUploadSettings((prev) => ({
      ...prev,
      [field]: checked,
    }));
  };

  const handleAuthInputChange = (field: keyof AuthSettingsData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setAuthSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAuthToggleChange = (field: keyof AuthSettingsData) => (checked: boolean) => {
    setAuthSettings((prev) => ({
      ...prev,
      [field]: checked,
    }));
  };

  const handleSeoInputChange = (field: keyof SeoSettingsData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setSeoSettings((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSeoToggleChange = (field: keyof SeoSettingsData) => (checked: boolean) => {
    setSeoSettings((prev) => ({
      ...prev,
      [field]: checked,
    }));
  };

  const handleNotificationInputChange = (field: keyof NotificationSettingsData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [field]: Number(e.target.value),
    }));
  };

  const handleNotificationToggleChange = (field: keyof NotificationSettingsData) => (checked: boolean) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [field]: checked,
    }));
  };

  const resetSiteSettings = () => {
    setFieldErrors(null);
    setFormMessage(null);
    setSiteSettings(initialSiteSettings);
  };

  const resetUploadSettings = () => {
    setFieldErrors(null);
    setFormMessage(null);
    setUploadSettings(initialUploadSettings);
  };

  const resetAuthSettings = () => {
    setFieldErrors(null);
    setFormMessage(null);
    setAuthSettings(initialAuthSettings);
    setSiteSettings((prev) => ({
      ...prev,
      userLayout: initialSiteSettings.userLayout,
    }));
  };

  const resetSeoSettings = () => {
    setFieldErrors(null);
    setFormMessage(null);
    setSeoSettings(initialSeoSettings);
  };

  const resetNotificationSettings = () => {
    setFieldErrors(null);
    setFormMessage(null);
    setNotificationSettings(initialNotificationSettings);
  };

  const handleSiteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors(null);
    setFormMessage(null);

    const currentAdminLayout = siteSettings.adminLayout;
    const formData = new FormData(e.currentTarget);
    const selectedAdminLayout = siteSettings.adminLayout;
    formData.set("adminLayout", selectedAdminLayout);
    formData.set("userLayout", siteSettings.userLayout);

    startTransition(async () => {
      const result = await updateSiteSettingsAdminAction(formData);

      if (!result.success) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);

          if (result.fieldErrors.appName) appNameRef.current?.focus();
          else if (result.fieldErrors.projectName) projectNameRef.current?.focus();
          else if (result.fieldErrors.projectTitle) projectTitleRef.current?.focus();
          else if (result.fieldErrors.siteUrl) siteUrlRef.current?.focus();
          else if (result.fieldErrors.apiBaseUrl) apiBaseUrlRef.current?.focus();
        } else {
          setFormMessage({ type: "error", message: result.message });
        }
        return;
      }

      if (result.data) setSiteSettings(result.data);
      setFormMessage({ type: "success", message: result.message });
      if (selectedAdminLayout !== currentAdminLayout) {
        window.location.assign("/admin");
        return;
      }
      router.refresh();
    });
  };

  const handleUploadSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors(null);
    setFormMessage(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateUploadSettingsAdminAction(formData);

      if (!result.success) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);

          if (result.fieldErrors.maxUploadSizeMb) maxUploadSizeMbRef.current?.focus();
          else if (result.fieldErrors.userStorageLimitMb) userStorageLimitMbRef.current?.focus();
          else if (result.fieldErrors.maxImageWidth) maxImageWidthRef.current?.focus();
          else if (result.fieldErrors.maxImageHeight) maxImageHeightRef.current?.focus();
          else if (result.fieldErrors.imageQuality) imageQualityRef.current?.focus();
          else if (result.fieldErrors.allowedExtensions) allowedExtensionsRef.current?.focus();
        } else {
          setFormMessage({ type: "error", message: result.message });
        }
        return;
      }

      if (result.data) setUploadSettings(result.data);
      setFormMessage({ type: "success", message: result.message });
    });
  };

  const handleAuthSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors(null);
    setFormMessage(null);

    const formData = new FormData(e.currentTarget);
    const siteFormData = new FormData();
    siteFormData.set("appName", siteSettings.appName);
    siteFormData.set("projectName", siteSettings.projectName);
    siteFormData.set("projectTitle", siteSettings.projectTitle);
    siteFormData.set("siteUrl", siteSettings.siteUrl);
    siteFormData.set("apiBaseUrl", siteSettings.apiBaseUrl || "");
    siteFormData.set("logoPath", siteSettings.logoPath || "");
    siteFormData.set("faviconPath", siteSettings.faviconPath || "");
    siteFormData.set("defaultOgImage", siteSettings.defaultOgImage || "");
    siteFormData.set("adminLayout", siteSettings.adminLayout);
    siteFormData.set("userLayout", siteSettings.userLayout);

    startTransition(async () => {
      const siteResult = await updateSiteSettingsAdminAction(siteFormData);

      if (!siteResult.success) {
        if (siteResult.fieldErrors) {
          setFieldErrors(siteResult.fieldErrors);
        } else {
          setFormMessage({ type: "error", message: siteResult.message });
        }
        return;
      }

      const result = await updateAuthSettingsAdminAction(formData);

      if (!result.success) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);

          if (result.fieldErrors.minPasswordLength) minPasswordLengthRef.current?.focus();
          else if (result.fieldErrors.loginFailLimit) loginFailLimitRef.current?.focus();
          else if (result.fieldErrors.loginFailWindowMinutes) loginFailWindowMinutesRef.current?.focus();
          else if (result.fieldErrors.loginLockMinutes) loginLockMinutesRef.current?.focus();
          else if (result.fieldErrors.accessTokenExpiresIn) accessTokenExpiresInRef.current?.focus();
          else if (result.fieldErrors.refreshTokenExpiresIn) refreshTokenExpiresInRef.current?.focus();
        } else {
          setFormMessage({ type: "error", message: result.message });
        }
        return;
      }

      if (siteResult.data) setSiteSettings(siteResult.data);
      if (result.data) setAuthSettings(result.data);
      setFormMessage({ type: "success", message: result.message });
      router.refresh();
    });
  };

  const handleSeoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors(null);
    setFormMessage(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateSeoSettingsAdminAction(formData);

      if (!result.success) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);

          if (result.fieldErrors.defaultTitle) defaultTitleRef.current?.focus();
          else if (result.fieldErrors.titleTemplate) titleTemplateRef.current?.focus();
          else if (result.fieldErrors.metaDescription) metaDescriptionRef.current?.focus();
          else if (result.fieldErrors.keywords) keywordsRef.current?.focus();
        } else {
          setFormMessage({ type: "error", message: result.message });
        }
        return;
      }

      if (result.data) setSeoSettings(result.data);
      setFormMessage({ type: "success", message: result.message });
    });
  };

  const handleNotificationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors(null);
    setFormMessage(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateNotificationSettingsAdminAction(formData);

      if (!result.success) {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);

          if (result.fieldErrors.unreadPreviewLimit) unreadPreviewLimitRef.current?.focus();
          else if (result.fieldErrors.historyPageSize) historyPageSizeRef.current?.focus();
          else if (result.fieldErrors.retentionDays) retentionDaysRef.current?.focus();
        } else {
          setFormMessage({ type: "error", message: result.message });
        }
        return;
      }

      if (result.data) setNotificationSettings(result.data);
      setFormMessage({ type: "success", message: result.message });
    });
  };

  const handleSubmit = activeSection === "site" ? handleSiteSubmit : activeSection === "upload" ? handleUploadSubmit : activeSection === "auth" ? handleAuthSubmit : activeSection === "seo" ? handleSeoSubmit : activeSection === "notification" ? handleNotificationSubmit : undefined;
  const handleReset = activeSection === "site" ? resetSiteSettings : activeSection === "upload" ? resetUploadSettings : activeSection === "auth" ? resetAuthSettings : activeSection === "seo" ? resetSeoSettings : activeSection === "notification" ? resetNotificationSettings : undefined;

  return (
    <form className="max-w-screen-2xl mx-auto px-3 py-10 dark:text-dark-100" onSubmit={handleSubmit}>
      <div className="mb-8 flex flex-wrap items-end gap-4">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-gray-400">System Control / {meta.eyebrow}</div>
          <div className="mt-2 text-lg font-semibold text-gray-700 dark:text-dark-100">{meta.label}</div>
          <div className="mt-1 text-sm text-gray-400">{meta.description}</div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            disabled={!handleReset || isPending}
            onClick={handleReset}
            className="border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:bg-white disabled:text-gray-400 dark:border-dark-700 dark:bg-dark-900 dark:text-dark-300 dark:hover:bg-dark-800 dark:hover:text-white dark:disabled:bg-dark-900 dark:disabled:text-dark-600"
          >
            초기화
          </Button>
          <Button
            type="submit"
            isLoading={isPending}
            disabled={!handleSubmit}
            className="!bg-blue-100 !text-blue-500 hover:!bg-blue-500 hover:!text-white disabled:!bg-blue-100 disabled:!text-blue-300"
          >
            저장하기
          </Button>
        </div>
      </div>

      {formMessage && (
        <div className={`mb-6 rounded-md px-3 py-2 text-sm leading-6 ${
          formMessage.type === "success" ? "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300" : "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-300"
        }`}>
          {formMessage.message}
        </div>
      )}

      {activeSection === "site" && (
        <>
          <SectionShell icon={<Globe2 size={13} />} title="브랜드 정보" description="사이트가 외부에 표시되는 기본 정보입니다.">
            <div className="grid gap-4 md:grid-cols-2">
              <InlineField title="사이트 이름(영문)" description="관리자와 시스템 화면에서 사용하는 영문 이름입니다." settingKey="APP_NAME">
                <InputField
                  ref={appNameRef}
                  inputTitle="APP_NAME"
                  name="appName"
                  value={siteSettings.appName}
                  onChange={handleSiteChange("appName")}
                  error={fieldErrors?.appName}
                  placeholder="Gjworks"
                  hideLabel
                />
              </InlineField>
              <InlineField title="사이트 이름(한글)" description="사용자에게 보여줄 한글 사이트 이름입니다." settingKey="PROJECT_TITLE">
                <InputField
                  ref={projectTitleRef}
                  inputTitle="PROJECT_TITLE"
                  name="projectTitle"
                  value={siteSettings.projectTitle}
                  onChange={handleSiteChange("projectTitle")}
                  error={fieldErrors?.projectTitle}
                  placeholder="지제이웍스"
                  hideLabel
                />
              </InlineField>
            </div>
            <InlineField title="프로젝트 이름" description="내부 식별과 시스템 표시에 사용할 이름입니다." settingKey="PROJECT_NAME">
              <InputField
                ref={projectNameRef}
                inputTitle="PROJECT_NAME"
                name="projectName"
                value={siteSettings.projectName}
                onChange={handleSiteChange("projectName")}
                error={fieldErrors?.projectName}
                placeholder="gjworks"
                hideLabel
              />
            </InlineField>
            <div className="grid gap-4 md:grid-cols-2">
              <InlineField title="사이트 대표 URL" description="외부에서 접근하는 대표 주소입니다." settingKey="NEXT_PUBLIC_DEFAULT_URL">
                <InputField
                  ref={siteUrlRef}
                  inputTitle="NEXT_PUBLIC_DEFAULT_URL"
                  name="siteUrl"
                  value={siteSettings.siteUrl}
                  onChange={handleSiteChange("siteUrl")}
                  error={fieldErrors?.siteUrl}
                  placeholder="https://gjworks.dev"
                  hideLabel
                />
              </InlineField>
              <InlineField title="API 기본 URL" description="클라이언트나 외부 연동에서 사용할 API 주소입니다." settingKey="NEXT_PUBLIC_API_BASE_URL">
                <InputField
                  ref={apiBaseUrlRef}
                  inputTitle="NEXT_PUBLIC_API_BASE_URL"
                  name="apiBaseUrl"
                  value={siteSettings.apiBaseUrl || ""}
                  onChange={handleSiteChange("apiBaseUrl")}
                  error={fieldErrors?.apiBaseUrl}
                  placeholder="http://host.docker.internal:3000"
                  hideLabel
                />
              </InlineField>
            </div>
          </SectionShell>

          <SectionShell icon={<Image size={13} />} title="대표 이미지" description="로고, 파비콘, 공유 이미지를 업로드합니다.">
            <FieldRow label="이미지 업로드" description="저장 시 파일이 업로드되고 사이트 설정에는 이미지 경로가 자동으로 기록됩니다.">
              <div className="grid gap-4 md:grid-cols-3">
                <SiteImageUploadField
                  title="로고 이미지"
                  description="헤더와 브랜드 영역에서 사용할 기본 로고입니다."
                  recommendedSize="권장 320x120px · PNG/WebP"
                  currentPath={siteSettings.logoPath}
                  pathName="logoPath"
                  fileName="logoFile"
                  variant="logo"
                />
                <SiteImageUploadField
                  title="파비콘"
                  description="브라우저 탭과 북마크에 표시할 아이콘입니다."
                  recommendedSize="권장 32x32px 또는 180x180px · ICO/PNG"
                  currentPath={siteSettings.faviconPath}
                  pathName="faviconPath"
                  fileName="faviconFile"
                  variant="favicon"
                />
                <SiteImageUploadField
                  title="기본 OG 이미지"
                  description="공유 이미지가 없을 때 사용할 대표 이미지입니다."
                  recommendedSize="권장 1200x630px · JPG/PNG/WebP"
                  currentPath={siteSettings.defaultOgImage}
                  pathName="defaultOgImage"
                  fileName="defaultOgImageFile"
                  variant="wide"
                />
              </div>
            </FieldRow>
          </SectionShell>

          <SectionShell icon={<ShieldCheck size={13} />} title="관리자 화면" description="관리자 페이지에서 사용할 레이아웃 스킨을 선택합니다.">
            <InlineField title="관리자 레이아웃" description="저장 후 관리자 페이지를 새로고침하면 선택한 레이아웃이 적용됩니다." settingKey="site.adminLayout">
              <select
                name="adminLayout"
                value={siteSettings.adminLayout}
                onChange={handleSiteSelectChange("adminLayout")}
                className={selectClass}
              >
                {adminLayoutOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="mt-2 text-xs leading-5 text-gray-400">
                {adminLayoutOptions.find((option) => option.key === siteSettings.adminLayout)?.description || "등록된 관리자 레이아웃입니다."}
              </div>
              {fieldErrors?.adminLayout && <div className="mt-2 text-xs text-red-500">{fieldErrors.adminLayout}</div>}
            </InlineField>
          </SectionShell>
        </>
      )}

      {activeSection === "seo" && (
        <>
          <SectionShell icon={<Search size={13} />} title="검색 노출" description="문서별 SEO 값이 없을 때 사용할 기본값입니다.">
            <div className="grid gap-4 md:grid-cols-2">
              <InlineField title="기본 메타 제목" description="페이지 제목이 명확하지 않을 때 사용할 사이트 대표 제목입니다." settingKey="seo.defaultTitle">
                <InputField
                  ref={defaultTitleRef}
                  inputTitle="기본 메타 제목"
                  name="defaultTitle"
                  value={seoSettings.defaultTitle}
                  onChange={handleSeoInputChange("defaultTitle")}
                  error={fieldErrors?.defaultTitle}
                  placeholder="지제이웍스"
                  hideLabel
                />
              </InlineField>
              <InlineField title="타이틀 규칙" description="%s 자리에 각 페이지 제목이 들어갑니다. 예: %s | 지제이웍스" settingKey="seo.titleTemplate">
                <InputField
                  ref={titleTemplateRef}
                  inputTitle="타이틀 규칙"
                  name="titleTemplate"
                  value={seoSettings.titleTemplate}
                  onChange={handleSeoInputChange("titleTemplate")}
                  error={fieldErrors?.titleTemplate}
                  placeholder="%s | 지제이웍스"
                  hideLabel
                />
              </InlineField>
            </div>
            <FieldRow label="기본 메타 설명" description="게시글이나 페이지가 별도 설명을 제공하지 않을 때 검색 결과와 공유 미리보기에서 사용합니다.">
              <textarea
                ref={metaDescriptionRef}
                className={textareaClass}
                name="metaDescription"
                rows={4}
                value={seoSettings.metaDescription}
                onChange={handleSeoInputChange("metaDescription")}
                placeholder="검색 결과에 노출될 기본 설명"
              />
              {fieldErrors?.metaDescription && <div className="mt-1.5 text-xs leading-5 text-red-500">{fieldErrors.metaDescription}</div>}
            </FieldRow>
            <FieldRow label="기본 키워드" description="쉼표로 구분해서 입력합니다. 최신 검색엔진 영향은 작지만 내부 검색/확장 기능에서 활용할 수 있습니다.">
              <textarea
                ref={keywordsRef}
                className={textareaClass}
                name="keywords"
                rows={3}
                value={seoSettings.keywords || ""}
                onChange={handleSeoInputChange("keywords")}
                placeholder="plextype, gjworks, xeant"
              />
              {fieldErrors?.keywords && <div className="mt-1.5 text-xs leading-5 text-red-500">{fieldErrors.keywords}</div>}
            </FieldRow>
            <FieldRow label="Robots" description="검색엔진 색인과 링크 추적 기본 정책입니다.">
              <div className="grid gap-4 md:grid-cols-2">
                <select className={selectClass} name="robotsIndex" value={seoSettings.robotsIndex} onChange={handleSeoInputChange("robotsIndex")}>
                  <option value="index">색인 허용</option>
                  <option value="noindex">색인 차단</option>
                </select>
                <select className={selectClass} name="robotsFollow" value={seoSettings.robotsFollow} onChange={handleSeoInputChange("robotsFollow")}>
                  <option value="follow">링크 추적 허용</option>
                  <option value="nofollow">링크 추적 차단</option>
                </select>
              </div>
            </FieldRow>
            <FieldRow label="소셜 카드" description="X/Twitter 등에서 링크를 공유할 때 사용할 카드 형태입니다. 대표 이미지가 있다면 큰 이미지 카드가 더 잘 보입니다.">
              <select className={selectClass} name="twitterCard" value={seoSettings.twitterCard} onChange={handleSeoInputChange("twitterCard")}>
                <option value="summary_large_image">큰 이미지 카드</option>
                <option value="summary">요약 카드</option>
              </select>
            </FieldRow>
          </SectionShell>

          <SectionShell icon={<Globe2 size={13} />} title="사이트맵" description="검색엔진에 전달할 URL 범위입니다.">
            <FieldRow label="사이트맵 정책" description="공개 메뉴와 공개 게시글을 sitemap.xml에 포함할지 정합니다. 비밀글과 외부 링크는 제외됩니다.">
              <div className="grid gap-4 md:grid-cols-3">
                <UploadTogglePolicy
                  title="사이트맵 사용"
                  description="끄면 sitemap.xml은 빈 목록에 가까운 기본 응답만 반환합니다."
                  name="sitemapEnabled"
                  checked={seoSettings.sitemapEnabled}
                  onChange={handleSeoToggleChange("sitemapEnabled")}
                />
                <UploadTogglePolicy
                  title="페이지 포함"
                  description="사이트맵 메뉴에 등록된 공개 내부 링크를 포함합니다."
                  name="includePagesInSitemap"
                  checked={seoSettings.includePagesInSitemap}
                  onChange={handleSeoToggleChange("includePagesInSitemap")}
                />
                <UploadTogglePolicy
                  title="게시글 포함"
                  description="공개 게시판의 일반 게시글 URL을 포함합니다."
                  name="includePostsInSitemap"
                  checked={seoSettings.includePostsInSitemap}
                  onChange={handleSeoToggleChange("includePostsInSitemap")}
                />
              </div>
            </FieldRow>
          </SectionShell>
        </>
      )}

      {activeSection === "auth" && (
        <>
          <SectionShell icon={<UserRound size={13} />} title="user 모듈 스킨 설정" description="/user 마이페이지 영역에서 사용할 user 모듈 스킨을 선택합니다.">
            <InlineField title="user 모듈 스킨" description="저장 후 /user 화면을 새로고침하면 선택한 user 모듈 스킨이 적용됩니다." settingKey="site.userLayout">
              <select
                name="userLayout"
                value={siteSettings.userLayout}
                onChange={handleSiteSelectChange("userLayout")}
                className={selectClass}
              >
                {userLayoutOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="mt-2 text-xs leading-5 text-gray-400">
                {userLayoutOptions.find((option) => option.key === siteSettings.userLayout)?.description || "등록된 user 모듈 스킨입니다."}
              </div>
              {fieldErrors?.userLayout && <div className="mt-2 text-xs text-red-500">{fieldErrors.userLayout}</div>}
            </InlineField>
          </SectionShell>

          <SectionShell icon={<UserRound size={13} />} title="회원가입" description="신규 회원이 들어오는 방식과 가입 직후 사용할 계정 상태를 정합니다.">
            <FieldRow label="회원가입 허용" description="꺼두면 회원가입 페이지 접근과 공개 회원가입 API 요청이 모두 차단됩니다. 관리자가 관리자 화면에서 직접 회원을 추가하는 기능은 유지됩니다.">
              <Toggle name="registrationEnabled" checked={authSettings.registrationEnabled} onChange={handleAuthToggleChange("registrationEnabled")} />
            </FieldRow>
            <FieldRow label="탈퇴 허용" description="꺼두면 사용자가 내 계정에서 직접 회원탈퇴를 진행할 수 없습니다. 관리자 삭제 권한에는 영향을 주지 않습니다.">
              <Toggle name="accountDeletionEnabled" checked={authSettings.accountDeletionEnabled} onChange={handleAuthToggleChange("accountDeletionEnabled")} />
            </FieldRow>
            <FieldRow label="가입 후 상태" description="신규 가입 계정에 자동으로 부여할 상태입니다. 승인 대기나 차단 상태인 일반 회원은 로그인할 수 없고, 관리자는 예외로 로그인할 수 있습니다.">
              <select className={selectClass} name="defaultUserStatus" value={authSettings.defaultUserStatus} onChange={handleAuthInputChange("defaultUserStatus")}>
                <option value="active">즉시 활성화</option>
                <option value="pending">승인 대기</option>
                <option value="blocked">차단 상태</option>
              </select>
            </FieldRow>
          </SectionShell>

          <SectionShell icon={<ShieldCheck size={13} />} title="비밀번호 정책" description="회원가입, 관리자 회원 등록/수정, 내 비밀번호 변경에 공통으로 적용됩니다.">
            <FieldRow label="최소 길이" description="비밀번호가 가져야 하는 최소 글자 수입니다. 너무 낮으면 계정 탈취 위험이 커지고, 너무 높으면 가입 전환이 떨어질 수 있습니다. 기본값은 8자입니다.">
              <InputField
                ref={minPasswordLengthRef}
                inputTitle="비밀번호 최소 길이"
                name="minPasswordLength"
                type="number"
                value={authSettings.minPasswordLength}
                onChange={handleAuthInputChange("minPasswordLength")}
                error={fieldErrors?.minPasswordLength}
                placeholder="8"
                hideLabel
              />
            </FieldRow>
            <FieldRow label="필수 문자" description="비밀번호에 반드시 포함해야 하는 문자 종류입니다. 여러 항목을 켜면 모든 조건을 동시에 만족해야 저장됩니다.">
              <div className="grid gap-3 md:grid-cols-3">
                <UploadTogglePolicy title="영문 포함" description="켜두면 a-z 또는 A-Z 문자가 최소 1개 이상 필요합니다." name="requirePasswordLetter" checked={authSettings.requirePasswordLetter} onChange={handleAuthToggleChange("requirePasswordLetter")} />
                <UploadTogglePolicy title="숫자 포함" description="켜두면 0-9 숫자가 최소 1개 이상 필요합니다." name="requirePasswordNumber" checked={authSettings.requirePasswordNumber} onChange={handleAuthToggleChange("requirePasswordNumber")} />
                <UploadTogglePolicy title="특수문자 포함" description="켜두면 !, @, # 같은 특수문자가 최소 1개 이상 필요합니다." name="requirePasswordSpecial" checked={authSettings.requirePasswordSpecial} onChange={handleAuthToggleChange("requirePasswordSpecial")} />
              </div>
            </FieldRow>
          </SectionShell>

          <SectionShell icon={<LockKeyhole size={13} />} title="인증 정책" description="로그인 유지 시간, 토큰 갱신, 반복 로그인 실패 시 잠금 기준을 정합니다.">
            <FieldRow label="토큰 유지 시간" description="Access Token은 짧게, Refresh Token은 상대적으로 길게 두는 값입니다. 15m, 1h, 7d처럼 숫자와 단위 s/m/h/d 조합으로 입력합니다.">
              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  ref={accessTokenExpiresInRef}
                  inputTitle="Access Token"
                  name="accessTokenExpiresIn"
                  value={authSettings.accessTokenExpiresIn}
                  onChange={handleAuthInputChange("accessTokenExpiresIn")}
                  error={fieldErrors?.accessTokenExpiresIn}
                  placeholder="1h"
                  hideLabel
                />
                <InputField
                  ref={refreshTokenExpiresInRef}
                  inputTitle="Refresh Token"
                  name="refreshTokenExpiresIn"
                  value={authSettings.refreshTokenExpiresIn}
                  onChange={handleAuthInputChange("refreshTokenExpiresIn")}
                  error={fieldErrors?.refreshTokenExpiresIn}
                  placeholder="4h"
                  hideLabel
                />
              </div>
            </FieldRow>
            <FieldRow label="로그인 실패 제한" description="같은 계정과 IP 조합에서 로그인 실패가 반복될 때 잠금 처리합니다. 예: 15분 동안 5회 실패하면 15분간 로그인을 막습니다.">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="mb-3 min-h-[52px]">
                    <div className="text-sm font-semibold text-gray-800 dark:text-dark-100">실패 허용 횟수</div>
                    <div className="mt-1 text-xs leading-5 text-gray-400">잠금 처리 전까지 허용할 로그인 실패 횟수입니다.</div>
                  </div>
                  <InputField
                    ref={loginFailLimitRef}
                    inputTitle="실패 허용 횟수"
                    name="loginFailLimit"
                    type="number"
                    value={authSettings.loginFailLimit}
                    onChange={handleAuthInputChange("loginFailLimit")}
                    error={fieldErrors?.loginFailLimit}
                    placeholder="5"
                    hideLabel
                  />
                </div>
                <div>
                  <div className="mb-3 min-h-[52px]">
                    <div className="text-sm font-semibold text-gray-800 dark:text-dark-100">실패 카운트 유지</div>
                    <div className="mt-1 text-xs leading-5 text-gray-400">실패 기록을 몇 분 동안 누적해서 볼지 정합니다.</div>
                  </div>
                  <InputField
                    ref={loginFailWindowMinutesRef}
                    inputTitle="실패 카운트 유지(분)"
                    name="loginFailWindowMinutes"
                    type="number"
                    value={authSettings.loginFailWindowMinutes}
                    onChange={handleAuthInputChange("loginFailWindowMinutes")}
                    error={fieldErrors?.loginFailWindowMinutes}
                    placeholder="15"
                    hideLabel
                  />
                </div>
                <div>
                  <div className="mb-3 min-h-[52px]">
                    <div className="text-sm font-semibold text-gray-800 dark:text-dark-100">잠금 시간</div>
                    <div className="mt-1 text-xs leading-5 text-gray-400">제한에 걸린 계정과 IP 조합을 몇 분 동안 막을지 정합니다.</div>
                  </div>
                  <InputField
                    ref={loginLockMinutesRef}
                    inputTitle="잠금 시간(분)"
                    name="loginLockMinutes"
                    type="number"
                    value={authSettings.loginLockMinutes}
                    onChange={handleAuthInputChange("loginLockMinutes")}
                    error={fieldErrors?.loginLockMinutes}
                    placeholder="15"
                    hideLabel
                  />
                </div>
              </div>
            </FieldRow>
            <FieldRow label="세션 정책" description="여러 기기 로그인 허용 여부와 관리자 페이지에서 세션을 계속 확인할지 정합니다. 보안을 우선하면 둘 다 켜두는 편이 좋습니다.">
              <div className="grid gap-3 md:grid-cols-2">
                <UploadTogglePolicy title="동시 로그인 허용" description="켜두면 여러 브라우저와 기기에서 동시에 로그인할 수 있습니다. 꺼두면 새 로그인 시 기존 접속 세션을 정리합니다." name="allowConcurrentSessions" checked={authSettings.allowConcurrentSessions} onChange={handleAuthToggleChange("allowConcurrentSessions")} />
                <UploadTogglePolicy title="관리자 세션 검문" description="켜두면 관리자 페이지가 포커스되거나 일정 시간이 지날 때 관리자 권한을 다시 확인합니다. 토큰 만료 후 오래 머무르는 상황을 줄입니다." name="adminSessionGuard" checked={authSettings.adminSessionGuard} onChange={handleAuthToggleChange("adminSessionGuard")} />
              </div>
            </FieldRow>
          </SectionShell>
        </>
      )}

      {activeSection === "upload" && (
        <>
          <SectionShell icon={<Upload size={13} />} title="파일 제한" description="업로드 가능한 파일의 크기와 범위입니다.">
            <FieldRow label="용량 및 이미지 크기" description="첨부파일 저장 용량은 MB 기준이고, 이미지 최대 너비는 px 기준입니다.">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <UploadNumberField
                  refObject={maxUploadSizeMbRef}
                  title="파일당 최대 용량"
                  description="파일 1개가 업로드될 수 있는 최대 크기입니다."
                  unit="MB"
                  name="maxUploadSizeMb"
                  value={uploadSettings.maxUploadSizeMb}
                  onChange={handleUploadInputChange("maxUploadSizeMb")}
                  error={fieldErrors?.maxUploadSizeMb}
                  placeholder="20"
                />
                <UploadNumberField
                  refObject={userStorageLimitMbRef}
                  title="사용자별 보관 용량"
                  description="한 사용자가 보관할 수 있는 전체 첨부파일 용량입니다."
                  unit="MB"
                  name="userStorageLimitMb"
                  value={uploadSettings.userStorageLimitMb}
                  onChange={handleUploadInputChange("userStorageLimitMb")}
                  error={fieldErrors?.userStorageLimitMb}
                  placeholder="1024"
                />
                <UploadNumberField
                  refObject={maxImageWidthRef}
                  title="이미지 최대 너비"
                  description="이 너비를 넘는 이미지는 비율을 유지한 채 줄입니다."
                  unit="PX"
                  name="maxImageWidth"
                  value={uploadSettings.maxImageWidth}
                  onChange={handleUploadInputChange("maxImageWidth")}
                  error={fieldErrors?.maxImageWidth}
                  placeholder="2560"
                />
                <UploadNumberField
                  refObject={maxImageHeightRef}
                  title="이미지 최대 높이"
                  description="이 높이를 넘는 이미지는 비율을 유지한 채 줄입니다."
                  unit="PX"
                  name="maxImageHeight"
                  value={uploadSettings.maxImageHeight}
                  onChange={handleUploadInputChange("maxImageHeight")}
                  error={fieldErrors?.maxImageHeight}
                  placeholder="2560"
                />
              </div>
            </FieldRow>
            <FieldRow label="이미지 처리" description="JPG, PNG, WebP, AVIF 업로드 시 sharp로 적용되는 이미지 최적화 정책입니다. GIF는 애니메이션 보호를 위해 원본 저장합니다.">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-md border border-gray-100 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-800 dark:text-dark-100">이미지 처리 사용</div>
                    <div className="mt-1 text-xs leading-5 text-gray-400">끄면 이미지도 원본 그대로 저장합니다.</div>
                  </div>
                  <Toggle
                    name="enableImageProcessing"
                    checked={uploadSettings.enableImageProcessing}
                    onChange={handleUploadToggleChange("enableImageProcessing")}
                  />
                </div>
                <div className="rounded-md border border-gray-100 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-800 dark:text-dark-100">메타데이터 제거</div>
                    <div className="mt-1 text-xs leading-5 text-gray-400">EXIF 위치정보와 촬영 정보를 제거합니다.</div>
                  </div>
                  <Toggle
                    name="stripImageMetadata"
                    checked={uploadSettings.stripImageMetadata}
                    onChange={handleUploadToggleChange("stripImageMetadata")}
                  />
                </div>
              </div>
            </FieldRow>
            <FieldRow label="이미지 품질" description="이미지를 재인코딩할 때 사용할 품질 값입니다. 낮을수록 용량은 줄고 화질 손실은 커집니다.">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_120px] md:items-center">
                <input
                  name="imageQuality"
                  type="range"
                  min={1}
                  max={100}
                  value={uploadSettings.imageQuality}
                  onChange={handleUploadInputChange("imageQuality")}
                  className="w-full accent-cyan-500"
                />
                <InputField
                  ref={imageQualityRef}
                  inputTitle="이미지 품질"
                  name="imageQuality"
                  type="number"
                  value={uploadSettings.imageQuality}
                  onChange={handleUploadInputChange("imageQuality")}
                  error={fieldErrors?.imageQuality}
                  placeholder="85"
                  hideLabel
                />
              </div>
            </FieldRow>
            <FieldRow label="이미지 출력 포맷" description="원본 유지 또는 지정 포맷으로 변환해 저장합니다. WebP는 용량 대비 품질이 좋아 일반적으로 무난합니다.">
              <select
                className={selectClass}
                name="imageOutputFormat"
                value={uploadSettings.imageOutputFormat}
                onChange={(event) => setUploadSettings((prev) => ({
                  ...prev,
                  imageOutputFormat: event.target.value as UploadSettingsData["imageOutputFormat"],
                }))}
              >
                <option value="original">원본 포맷 유지</option>
                <option value="webp">WebP로 변환</option>
                <option value="jpeg">JPEG로 변환</option>
                <option value="png">PNG로 변환</option>
                <option value="avif">AVIF로 변환</option>
              </select>
              {fieldErrors?.imageOutputFormat && <div className="mt-1.5 text-xs leading-5 text-red-500">{fieldErrors.imageOutputFormat}</div>}
            </FieldRow>
            <FieldRow label="허용 확장자" description="쉼표로 구분된 확장자 목록입니다.">
              <textarea
                ref={allowedExtensionsRef}
                className={textareaClass}
                name="allowedExtensions"
                rows={3}
                value={uploadSettings.allowedExtensions}
                onChange={handleUploadInputChange("allowedExtensions")}
                placeholder=".png, .jpg, .jpeg, .gif, .webp, .mp4, .zip"
              />
              {fieldErrors?.allowedExtensions && <div className="mt-1.5 text-xs leading-5 text-red-500">{fieldErrors.allowedExtensions}</div>}
            </FieldRow>
          </SectionShell>

          <SectionShell icon={<ShieldCheck size={13} />} title="검증 정책" description="파일 업로드 시 적용할 보안 검증입니다.">
            <FieldRow label="파일 형식 검증" description="확장자만 믿지 않고 브라우저가 전달한 MIME 타입도 함께 확인합니다.">
              <div className="grid gap-4 md:grid-cols-2">
                <UploadTogglePolicy
                  title="MIME 타입 검증"
                  description=".jpg 파일이 실제 JPEG인지처럼 확장자와 MIME 타입이 맞는지 검사합니다."
                  name="verifyMimeType"
                  checked={uploadSettings.verifyMimeType}
                  onChange={handleUploadToggleChange("verifyMimeType")}
                />
                <UploadTogglePolicy
                  title="프로필 이미지 제한"
                  description="프로필 이미지 선택 화면에서는 이미지 MIME 타입만 허용하도록 제한합니다."
                  name="restrictProfileImage"
                  checked={uploadSettings.restrictProfileImage}
                  onChange={handleUploadToggleChange("restrictProfileImage")}
                />
              </div>
            </FieldRow>
            <FieldRow label="파일 종류 허용" description="게시글/댓글 첨부에서 이미지 외 파일을 어느 범위까지 허용할지 정합니다.">
              <div className="grid gap-4 md:grid-cols-2">
                <UploadTogglePolicy
                  title="동영상 허용"
                  description="MP4, WebM, MOV 같은 동영상 첨부를 허용합니다. 끄면 이미지/오디오 등 다른 허용 파일만 업로드됩니다."
                  name="allowVideo"
                  checked={uploadSettings.allowVideo}
                  onChange={handleUploadToggleChange("allowVideo")}
                />
                <UploadTogglePolicy
                  title="압축파일 허용"
                  description="ZIP 첨부를 허용합니다. 배포 파일이나 자료실 용도가 아니라면 끄는 편이 안전합니다."
                  name="allowArchive"
                  checked={uploadSettings.allowArchive}
                  onChange={handleUploadToggleChange("allowArchive")}
                />
              </div>
            </FieldRow>
          </SectionShell>
        </>
      )}

      {activeSection === "notification" && (
        <>
          <SectionShell icon={<Bell size={13} />} title="알림 생성" description="어떤 이벤트에서 알림을 만들지 정합니다. 글/댓글 작성 화면의 개별 수신 옵션도 이 정책 아래에서 동작합니다.">
            <FieldRow label="커뮤니티 알림" description="댓글과 답글은 알림이 많이 발생하기 쉬운 영역입니다. 전체 정책을 끄면 개별 글/댓글 옵션보다 우선합니다.">
              <div className="grid gap-4 md:grid-cols-2">
                <UploadTogglePolicy
                  title="댓글 알림"
                  description="게시글에 새 댓글이 달리면 글 작성자에게 알림을 보냅니다."
                  name="commentNotificationsEnabled"
                  checked={notificationSettings.commentNotificationsEnabled}
                  onChange={handleNotificationToggleChange("commentNotificationsEnabled")}
                />
                <UploadTogglePolicy
                  title="답글 알림"
                  description="내 댓글에 답글이 달리면 댓글 작성자에게 알림을 보냅니다."
                  name="replyNotificationsEnabled"
                  checked={notificationSettings.replyNotificationsEnabled}
                  onChange={handleNotificationToggleChange("replyNotificationsEnabled")}
                />
              </div>
            </FieldRow>
            <FieldRow label="관리 알림" description="관리자 화면에서 발생한 강제 처리 이벤트를 사용자에게 알릴지 정합니다.">
              <div className="grid gap-4 md:grid-cols-2">
                <UploadTogglePolicy
                  title="콘텐츠 처리 알림"
                  description="관리자가 게시글, 댓글, 첨부파일을 삭제하면 작성자에게 알림을 보냅니다."
                  name="adminContentNotificationsEnabled"
                  checked={notificationSettings.adminContentNotificationsEnabled}
                  onChange={handleNotificationToggleChange("adminContentNotificationsEnabled")}
                />
                <UploadTogglePolicy
                  title="강제 로그아웃 알림"
                  description="관리자가 접속 중인 사용자를 강제로 로그아웃했을 때 알림을 보냅니다."
                  name="forceLogoutNotificationsEnabled"
                  checked={notificationSettings.forceLogoutNotificationsEnabled}
                  onChange={handleNotificationToggleChange("forceLogoutNotificationsEnabled")}
                />
              </div>
            </FieldRow>
            <FieldRow label="공통 정책" description="알림 생성 후 실시간 전달과 토스트 표시 방식을 정합니다.">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <UploadTogglePolicy
                  title="본인 액션 제외"
                  description="내가 작성한 댓글이나 처리로 나에게 알림이 가지 않게 합니다."
                  name="excludeSelfNotifications"
                  checked={notificationSettings.excludeSelfNotifications}
                  onChange={handleNotificationToggleChange("excludeSelfNotifications")}
                />
                <UploadTogglePolicy
                  title="실시간 알림"
                  description="DB 저장 후 SSE로 즉시 브라우저에 전달합니다."
                  name="realtimeNotificationsEnabled"
                  checked={notificationSettings.realtimeNotificationsEnabled}
                  onChange={handleNotificationToggleChange("realtimeNotificationsEnabled")}
                />
                <UploadTogglePolicy
                  title="토스트 표시"
                  description="실시간 알림을 화면 우측 토스트로 표시합니다."
                  name="toastNotificationsEnabled"
                  checked={notificationSettings.toastNotificationsEnabled}
                  onChange={handleNotificationToggleChange("toastNotificationsEnabled")}
                />
                <UploadTogglePolicy
                  title="썸네일 표시"
                  description="알림에 이미지가 있으면 토스트와 목록에 함께 표시합니다."
                  name="showNotificationThumbnails"
                  checked={notificationSettings.showNotificationThumbnails}
                  onChange={handleNotificationToggleChange("showNotificationThumbnails")}
                />
              </div>
            </FieldRow>
          </SectionShell>

          <SectionShell icon={<Smartphone size={13} />} title="전달 채널" description="설치형 웹앱, 브라우저 푸시, 모바일 앱 푸시를 서비스별로 켜고 끕니다. 키와 secret은 환경변수/서버 secret에서 관리합니다.">
            <FieldRow label="채널 사용 여부" description="plextype core는 기능 엔진만 제공하고, 실제 서비스에서는 필요한 채널만 활성화합니다.">
              <div className="grid gap-4 md:grid-cols-3">
                <UploadTogglePolicy
                  title="PWA 사용"
                  description="manifest, service worker, 앱 설치 버튼, 앱 배지 동기화를 사용합니다."
                  name="pwaEnabled"
                  checked={notificationSettings.pwaEnabled}
                  onChange={handleNotificationToggleChange("pwaEnabled")}
                />
                <UploadTogglePolicy
                  title="Web Push 사용"
                  description="브라우저 구독 등록과 Web Push 발송을 허용합니다. VAPID 키가 필요합니다."
                  name="webPushEnabled"
                  checked={notificationSettings.webPushEnabled}
                  onChange={handleNotificationToggleChange("webPushEnabled")}
                />
                <UploadTogglePolicy
                  title="FCM 모바일 푸시"
                  description="모바일 앱 토큰 등록과 Firebase 발송을 허용합니다. Firebase secret이 필요합니다."
                  name="fcmPushEnabled"
                  checked={notificationSettings.fcmPushEnabled}
                  onChange={handleNotificationToggleChange("fcmPushEnabled")}
                />
              </div>
            </FieldRow>
          </SectionShell>

          <SectionShell icon={<Smartphone size={13} />} title="PWA / Web Push" description="설치형 웹앱과 브라우저 푸시가 실제 사용자 환경에서 동작 가능한지 확인합니다.">
            <FieldRow label="서버 준비 상태" description="배포 환경에서는 HTTPS와 VAPID 키가 모두 준비되어야 브라우저 푸시가 발송됩니다.">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-dark-50">PWA 리소스</div>
                      <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-dark-400">매니페스트, 서비스워커, 앱 아이콘 라우트 상태입니다.</p>
                    </div>
                    <button
                      type="button"
                      onClick={refreshPwaStatus}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 dark:border-dark-700 dark:text-dark-300 dark:hover:bg-dark-800"
                      aria-label="PWA 상태 새로고침"
                    >
                      <RefreshCw size={14} className={pwaStatusLoading ? "animate-spin" : ""} />
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <StatusPill ok={Boolean(pwaStatus?.pwa.enabled)} label="Enabled" />
                    <StatusPill ok={Boolean(pwaStatus?.pwa.manifest)} label="Manifest" />
                    <StatusPill ok={Boolean(pwaStatus?.pwa.serviceWorker)} label="Service Worker" />
                    <StatusPill ok={Boolean(pwaStatus?.pwa.icons)} label="Icons" />
                    <StatusPill ok={Boolean(pwaStatus?.pwa.secureContext)} label="HTTPS/localhost" />
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-dark-50">Web Push 서버</div>
                    <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-dark-400">VAPID 환경변수와 현재 활성 브라우저 구독 수입니다.</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <StatusPill ok={Boolean(pwaStatus?.webPush.enabled)} label="Enabled" />
                    <StatusPill ok={Boolean(pwaStatus?.webPush.configured)} label="VAPID configured" />
                    <StatusPill ok={Boolean(pwaStatus?.webPush.publicKey)} label="Public key" />
                    <StatusPill ok={Boolean(pwaStatus?.webPush.privateKey)} label="Private key" />
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600 dark:bg-dark-800 dark:text-dark-300">
                      구독 {pwaStatus?.webPush.activeSubscriptions ?? 0}개
                    </span>
                  </div>
                  <p className="mt-3 text-[11px] leading-5 text-gray-400 dark:text-dark-500">
                    Subject: {pwaStatus?.webPush.subject || "환경변수 확인 전"}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900 lg:col-span-2">
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-dark-50">FCM 모바일 푸시</div>
                    <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-dark-400">Firebase 프로젝트 ID와 Admin SDK secret 연결 상태입니다.</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <StatusPill ok={Boolean(pwaStatus?.fcmPush.enabled)} label="Enabled" />
                    <StatusPill ok={Boolean(pwaStatus?.fcmPush.projectId)} label="Project ID" />
                    <StatusPill ok={Boolean(pwaStatus?.fcmPush.credentials)} label="Admin SDK secret" />
                  </div>
                </div>
              </div>
            </FieldRow>

            <FieldRow label="현재 브라우저" description="이 브라우저를 테스트 구독으로 등록해 실제 푸시 수신 준비 상태를 확인합니다.">
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-dark-50">브라우저 푸시 구독</div>
                    <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-dark-400">
                      권한: {browserPushState.permission} · 상태: {browserPushState.subscribed ? "구독됨" : "미구독"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={refreshBrowserPushState}
                      className="rounded-full border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-dark-700 dark:text-dark-300 dark:hover:bg-dark-800"
                    >
                      상태 확인
                    </button>
                    {browserPushState.subscribed ? (
                      <button
                        type="button"
                        onClick={handleDisableWebPush}
                        className="rounded-full bg-gray-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-dark-100"
                      >
                        구독 해제
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleEnableWebPush}
                        className="rounded-full bg-gray-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-dark-100"
                      >
                        브라우저 알림 켜기
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusPill ok={browserPushState.serviceWorker} label="Service Worker" />
                  <StatusPill ok={browserPushState.pushManager} label="Push Manager" />
                  <StatusPill ok={browserPushState.notification} label="Notification API" />
                  <StatusPill ok={browserPushState.badge} label="App Badge" />
                </div>
              </div>
            </FieldRow>
          </SectionShell>

          <SectionShell icon={<Bell size={13} />} title="알림 보관" description="알림 목록과 히스토리 화면의 기본값입니다.">
            <FieldRow label="노출 및 보관" description="알림 API가 기본으로 가져오는 개수와 보관 기간입니다. 보관 기간 정리는 추후 배치/관리 액션에서 이 값을 사용합니다.">
              <div className="grid gap-4 md:grid-cols-3">
                <UploadNumberField
                  refObject={unreadPreviewLimitRef}
                  title="메뉴 미리보기"
                  description="알림 메뉴와 unread API에서 가져올 최대 개수입니다."
                  unit="개"
                  name="unreadPreviewLimit"
                  value={notificationSettings.unreadPreviewLimit}
                  onChange={handleNotificationInputChange("unreadPreviewLimit")}
                  error={fieldErrors?.unreadPreviewLimit}
                  placeholder="20"
                />
                <UploadNumberField
                  refObject={historyPageSizeRef}
                  title="히스토리 페이지"
                  description="알림 기록 화면의 기본 페이지 크기입니다."
                  unit="개"
                  name="historyPageSize"
                  value={notificationSettings.historyPageSize}
                  onChange={handleNotificationInputChange("historyPageSize")}
                  error={fieldErrors?.historyPageSize}
                  placeholder="20"
                />
                <UploadNumberField
                  refObject={retentionDaysRef}
                  title="보관 기간"
                  description="알림 기록을 보관할 기준 일수입니다."
                  unit="일"
                  name="retentionDays"
                  value={notificationSettings.retentionDays}
                  onChange={handleNotificationInputChange("retentionDays")}
                  error={fieldErrors?.retentionDays}
                  placeholder="90"
                />
              </div>
            </FieldRow>
          </SectionShell>
        </>
      )}
    </form>
  );
};

export default Settings;
