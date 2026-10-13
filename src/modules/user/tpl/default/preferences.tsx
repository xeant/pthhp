"use client";

import type React from "react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Bell, Check, Monitor, Moon, RefreshCw, Settings2, Smartphone, Sun, Type, Wand2 } from "lucide-react";

import Button from "@/core/components/button/Button";
import { syncThemeColorMeta } from "@/core/utils/theme/themeColor";
import HeaderUser from "@/modules/user/tpl/default/header";
import {
  UserFontScalePreference,
  UserPreferenceData,
  UserThemePreference,
} from "@/modules/user/actions/preference.query";
import { saveMyPreferenceAction } from "@/modules/user/actions/preference.action";

type PreferencesProps = {
  initialPreference: UserPreferenceData;
};

type BrowserPushState = {
  checked: boolean;
  serviceWorker: boolean;
  pushManager: boolean;
  notification: boolean;
  badge: boolean;
  permission: NotificationPermission | "unsupported";
  subscribed: boolean;
  activeSubscriptions: number;
};

const themeOptions: Array<{
  value: UserThemePreference;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  { value: "system", label: "시스템", description: "기기 설정을 따라갑니다.", icon: <Monitor size={16} /> },
  { value: "light", label: "라이트", description: "밝은 화면을 유지합니다.", icon: <Sun size={16} /> },
  { value: "dark", label: "다크", description: "어두운 화면을 유지합니다.", icon: <Moon size={16} /> },
];

const fontScaleOptions: Array<{
  value: UserFontScalePreference;
  label: string;
  description: string;
}> = [
  { value: "small", label: "작게", description: "정보 밀도를 높입니다." },
  { value: "normal", label: "기본", description: "기본 크기로 표시합니다." },
  { value: "large", label: "크게", description: "텍스트를 더 쉽게 읽습니다." },
];

const applyClientTheme = (theme: UserThemePreference) => {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldUseDark = theme === "dark" || (theme === "system" && prefersDark);

  document.documentElement.classList.toggle("dark", shouldUseDark);
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = shouldUseDark ? "dark" : "light";
  syncThemeColorMeta(shouldUseDark ? "dark" : "light");
  localStorage.setItem("userThemePreference", theme);
  document.cookie = `userThemePreference=${encodeURIComponent(theme)}; path=/; max-age=31536000; samesite=lax`;
};

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

const PushStatusPill = ({ ok, label }: { ok: boolean; label: string }) => {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
      ok
        ? "bg-gray-900 text-white dark:bg-dark-100 dark:text-dark-950"
        : "bg-gray-100 text-gray-400 dark:bg-dark-800 dark:text-dark-400"
    }`}>
      {label}
    </span>
  );
};

const PreferenceToggle = ({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex cursor-pointer items-center justify-between gap-4 rounded-md border border-gray-200 bg-white p-4 text-left shadow-sm shadow-gray-100 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20 dark:hover:border-dark-700 dark:hover:bg-dark-800"
      aria-pressed={checked}
    >
      <span>
        <span className="block text-sm font-semibold text-gray-900 dark:text-dark-100">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-gray-400 dark:text-dark-400">{description}</span>
      </span>
      <span
        className="relative block h-6 w-11 min-w-11 rounded-full bg-gray-200 transition-colors data-[checked=true]:bg-gray-900 dark:bg-dark-700 dark:data-[checked=true]:bg-dark-100"
        data-checked={checked}
      >
        <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform dark:bg-dark-950 ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </span>
    </button>
  );
};

const Preferences = ({ initialPreference }: PreferencesProps) => {
  const [preference, setPreference] = useState<UserPreferenceData>(initialPreference);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pushMessage, setPushMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pushBusy, setPushBusy] = useState(false);
  const [browserPushState, setBrowserPushState] = useState<BrowserPushState>({
    checked: false,
    serviceWorker: false,
    pushManager: false,
    notification: false,
    badge: false,
    permission: "unsupported",
    subscribed: false,
    activeSubscriptions: 0,
  });
  const [isPending, startTransition] = useTransition();

  const formData = useMemo(() => {
    const data = new FormData();
    Object.entries(preference).forEach(([key, value]) => {
      data.set(key, String(value));
    });
    return data;
  }, [preference]);

  const handleThemeChange = (theme: UserThemePreference) => {
    setPreference((prev) => ({ ...prev, theme }));
    applyClientTheme(theme);
  };

  const handleFontScaleChange = (fontScale: UserFontScalePreference) => {
    setPreference((prev) => ({ ...prev, fontScale }));
    document.documentElement.dataset.fontScale = fontScale;
  };

  const refreshBrowserPushState = async () => {
    if (typeof window === "undefined" || typeof navigator === "undefined") return;

    const serviceWorker = "serviceWorker" in navigator;
    const pushManager = "PushManager" in window;
    const notification = "Notification" in window;
    const badge = "setAppBadge" in navigator || "clearAppBadge" in navigator;
    let subscribed = false;
    let activeSubscriptions = 0;

    if (serviceWorker && pushManager) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        subscribed = Boolean(subscription);
      } catch {
        subscribed = false;
      }
    }

    try {
      const response = await fetch("/api/web-push/subscriptions", {
        credentials: "include",
        cache: "no-store",
      });
      const result = await response.json();
      activeSubscriptions = Number(result?.activeSubscriptions || 0);
    } catch {
      activeSubscriptions = 0;
    }

    setBrowserPushState({
      checked: true,
      serviceWorker,
      pushManager,
      notification,
      badge,
      permission: notification ? Notification.permission : "unsupported",
      subscribed,
      activeSubscriptions,
    });
  };

  const handleEnableWebPush = async () => {
    setPushBusy(true);
    setPushMessage(null);

    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setPushMessage({ type: "error", text: "현재 브라우저는 브라우저 알림을 지원하지 않습니다." });
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        await refreshBrowserPushState();
        setPushMessage({ type: "error", text: "브라우저 알림 권한이 허용되지 않았습니다." });
        return;
      }

      const keyResponse = await fetch("/api/web-push/vapid-public-key", {
        credentials: "include",
        cache: "no-store",
      });
      const keyResult = await keyResponse.json();

      if (!keyResponse.ok || !keyResult?.publicKey) {
        setPushMessage({ type: "error", text: keyResult?.message || "브라우저 알림 키를 불러오지 못했습니다." });
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
        setPushMessage({ type: "error", text: saveResult?.message || "브라우저 알림 등록에 실패했습니다." });
        return;
      }

      await refreshBrowserPushState();
      setPushMessage({ type: "success", text: "이 브라우저에서 알림을 받을 수 있습니다." });
    } catch (error) {
      console.error("Preference web push enable failed:", error);
      setPushMessage({ type: "error", text: "브라우저 알림을 켜는 중 오류가 발생했습니다." });
    } finally {
      setPushBusy(false);
    }
  };

  const handleDisableWebPush = async () => {
    setPushBusy(true);
    setPushMessage(null);

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
      setPushMessage({ type: "success", text: "이 브라우저의 알림 구독을 해제했습니다." });
    } catch (error) {
      console.error("Preference web push disable failed:", error);
      setPushMessage({ type: "error", text: "브라우저 알림을 끄는 중 오류가 발생했습니다." });
    } finally {
      setPushBusy(false);
    }
  };

  useEffect(() => {
    refreshBrowserPushState();
  }, []);

  const handleSubmit = () => {
    setMessage(null);

    startTransition(async () => {
      const result = await saveMyPreferenceAction(formData);

      if (!result.success || !result.data) {
        setMessage({ type: "error", text: result.message || "개인 설정 저장에 실패했습니다." });
        return;
      }

      setPreference(result.data);
      setMessage({ type: "success", text: result.message || "개인 설정이 저장되었습니다." });
      applyClientTheme(result.data.theme);
    });
  };

	  return (
	    <>
	      <HeaderUser />
	      <div className="min-h-screen bg-gray-50 dark:bg-dark-950 dark:text-dark-100">
	        <div className="mx-auto max-w-screen-xl px-3 py-6 md:px-6 md:py-8">
	          <div className="mx-auto max-w-3xl rounded-md border border-gray-200 bg-white p-5 shadow-sm shadow-gray-100 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20">
	            <section className="border-b border-gray-200 pb-6 dark:border-dark-800">
	              <div className="flex items-end justify-between gap-4">
	                <div>
	                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-dark-500">
	                    <Settings2 size={14} />
	                    My Preference
	                  </div>
	                  <h1 className="mt-2 text-2xl font-black tracking-tight text-gray-950 dark:text-dark-100">개인 설정</h1>
	                  <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400 dark:text-dark-400">
	                    화면 표시, 알림 수신, 작성 환경을 내 계정 기준으로 저장합니다.
	                  </p>
	                </div>
	              </div>
	            </section>
	
	            {message && (
	              <div className={`mt-5 rounded-md px-3 py-2 text-sm ${
	                message.type === "success"
	                  ? "bg-gray-100 text-gray-700 dark:bg-dark-900 dark:text-dark-200"
	                  : "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-300"
	              }`}>
	                {message.text}
	              </div>
	            )}
	
	            <section className="mt-6 space-y-4">
	              <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm shadow-gray-100 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20">
	                <div className="mb-4 flex items-start gap-3">
	                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-dark-800 dark:text-dark-300">
	                    <Wand2 size={17} />
	                  </div>
	                  <div>
	                    <div className="text-sm font-black text-gray-950 dark:text-dark-100">화면 표시</div>
	                    <p className="mt-1 text-xs leading-5 text-gray-400 dark:text-dark-400">
	                      다크모드와 읽기 편의성을 설정합니다.
	                    </p>
	                  </div>
	                </div>
	
	                <div className="grid gap-3 md:grid-cols-3">
	                  {themeOptions.map((item) => {
	                    const active = preference.theme === item.value;
	                    return (
	                      <button
	                        key={item.value}
	                        type="button"
	                        onClick={() => handleThemeChange(item.value)}
	                        className={`cursor-pointer rounded-md border p-4 text-left shadow-sm transition-colors ${
	                          active
	                            ? "border-gray-900 bg-gray-950 text-white shadow-gray-200 dark:border-dark-100 dark:bg-dark-100 dark:text-dark-950 dark:shadow-black/20"
	                            : "border-gray-200 bg-white text-gray-500 shadow-gray-100 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-950 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-300 dark:shadow-black/20 dark:hover:border-dark-700 dark:hover:bg-dark-800 dark:hover:text-dark-100"
	                        }`}
	                      >
	                        <span className={`mb-4 flex h-9 w-9 items-center justify-center rounded-full ${
	                          active ? "bg-white/15 text-current dark:bg-dark-950/10" : "bg-gray-100 text-gray-500 dark:bg-dark-800 dark:text-dark-300"
	                        }`}>
	                          {item.icon}
	                        </span>
	                        <span className="block text-sm font-bold">{item.label}</span>
	                        <span className="mt-1 block text-xs leading-5 opacity-70">{item.description}</span>
	                      </button>
	                    );
	                  })}
	                </div>
	
	                <div className="mt-3 grid gap-3 md:grid-cols-3">
	                  {fontScaleOptions.map((item) => {
	                    const active = preference.fontScale === item.value;
	                    return (
	                      <button
	                        key={item.value}
	                        type="button"
	                        onClick={() => handleFontScaleChange(item.value)}
	                        className={`flex cursor-pointer items-center gap-3 rounded-md border p-4 text-left shadow-sm transition-colors ${
	                          active
	                            ? "border-gray-900 bg-gray-950 text-white shadow-gray-200 dark:border-dark-100 dark:bg-dark-100 dark:text-dark-950 dark:shadow-black/20"
	                            : "border-gray-200 bg-white text-gray-500 shadow-gray-100 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-950 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-300 dark:shadow-black/20 dark:hover:border-dark-700 dark:hover:bg-dark-800 dark:hover:text-dark-100"
	                        }`}
	                      >
	                        <Type size={16} />
	                        <span>
	                          <span className="block text-sm font-bold">{item.label}</span>
	                          <span className="mt-1 block text-xs opacity-70">{item.description}</span>
	                        </span>
	                      </button>
	                    );
	                  })}
	                </div>
	
	                <div className="mt-3">
	                  <PreferenceToggle
	                    title="애니메이션 줄이기"
	                    description="움직임이 많은 전환 효과를 줄이는 설정입니다."
	                    checked={preference.reduceMotion}
	                    onChange={(checked) => {
	                      setPreference((prev) => ({ ...prev, reduceMotion: checked }));
	                      document.documentElement.dataset.motion = checked ? "reduced" : "default";
	                    }}
	                  />
	                </div>
	              </div>
	
	              <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm shadow-gray-100 dark:border-dark-800 dark:bg-dark-900 dark:shadow-black/20">
	                <div className="mb-4 flex items-start gap-3">
	                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-dark-800 dark:text-dark-300">
	                    <Bell size={17} />
	                  </div>
	                  <div>
	                    <div className="text-sm font-black text-gray-950 dark:text-dark-100">알림 수신</div>
	                    <p className="mt-1 text-xs leading-5 text-gray-400 dark:text-dark-400">
	                      내 활동 흐름에 맞춰 받을 알림을 줄입니다.
	                    </p>
	                  </div>
	                </div>
	
	                <div className="grid gap-3">
	                  <PreferenceToggle title="댓글 알림" description="내 글에 새 댓글이 달릴 때 알림을 받습니다." checked={preference.notifyComments} onChange={(checked) => setPreference((prev) => ({ ...prev, notifyComments: checked }))} />
	                  <PreferenceToggle title="답글 알림" description="내 댓글에 답글이 달릴 때 알림을 받습니다." checked={preference.notifyReplies} onChange={(checked) => setPreference((prev) => ({ ...prev, notifyReplies: checked }))} />
	                  <PreferenceToggle title="운영 알림" description="관리자 안내와 강제 처리 알림을 받습니다." checked={preference.notifyAdmin} onChange={(checked) => setPreference((prev) => ({ ...prev, notifyAdmin: checked }))} />
	                </div>

	                <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-dark-800 dark:bg-dark-950">
	                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
	                    <div className="flex items-start gap-3">
	                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm shadow-gray-100 dark:bg-dark-900 dark:text-dark-300 dark:shadow-black/20">
	                        <Smartphone size={17} />
	                      </div>
	                      <div>
	                        <div className="text-sm font-black text-gray-950 dark:text-dark-100">브라우저 알림</div>
	                        <p className="mt-1 text-xs leading-5 text-gray-400 dark:text-dark-400">
	                          이 브라우저에서 댓글, 답글, 로그인 알림을 macOS 알림으로 받습니다.
	                        </p>
	                        <p className="mt-1 text-[11px] leading-5 text-gray-400 dark:text-dark-500">
	                          권한: {browserPushState.permission} · 상태: {browserPushState.subscribed ? "구독됨" : "미구독"} · 등록 기기 {browserPushState.activeSubscriptions}개
	                        </p>
	                      </div>
	                    </div>
	                    <div className="flex flex-wrap gap-2 md:justify-end">
	                      <button
	                        type="button"
	                        onClick={refreshBrowserPushState}
	                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 dark:border-dark-700 dark:bg-dark-900 dark:text-dark-300 dark:hover:bg-dark-800"
	                        aria-label="브라우저 알림 상태 새로고침"
	                      >
	                        <RefreshCw size={14} />
	                      </button>
	                      {browserPushState.subscribed ? (
	                        <button
	                          type="button"
	                          onClick={handleDisableWebPush}
	                          disabled={pushBusy}
	                          className="rounded-full bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-dark-100 dark:text-dark-950 dark:hover:bg-white"
	                        >
	                          알림 끄기
	                        </button>
	                      ) : (
	                        <button
	                          type="button"
	                          onClick={handleEnableWebPush}
	                          disabled={pushBusy}
	                          className="rounded-full bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-dark-100 dark:text-dark-950 dark:hover:bg-white"
	                        >
	                          알림 켜기
	                        </button>
	                      )}
	                    </div>
	                  </div>

	                  <div className="mt-4 flex flex-wrap gap-2">
	                    <PushStatusPill ok={browserPushState.serviceWorker} label="Service Worker" />
	                    <PushStatusPill ok={browserPushState.pushManager} label="Push" />
	                    <PushStatusPill ok={browserPushState.notification} label="Notification" />
	                    <PushStatusPill ok={browserPushState.badge} label="Badge" />
	                  </div>

	                  {pushMessage && (
	                    <div className={`mt-3 rounded-md px-3 py-2 text-xs leading-5 ${
	                      pushMessage.type === "success"
	                        ? "bg-white text-gray-600 dark:bg-dark-900 dark:text-dark-200"
	                        : "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-300"
	                    }`}>
	                      {pushMessage.text}
	                    </div>
	                  )}
	                </div>
	              </div>
	
	            </section>
	
	            <div className="sticky bottom-0 mt-6 flex items-center justify-end border-t border-gray-200 bg-white/90 py-4 backdrop-blur-xl dark:border-dark-800 dark:bg-dark-900/90">
	              <Button
	                type="button"
	                onClick={handleSubmit}
	                isLoading={isPending}
	                icon={<Check size={15} />}
	                fullWidth={false}
	              >
	                저장하기
	              </Button>
	            </div>
	          </div>
	        </div>
	      </div>
	    </>
	  );
};

export default Preferences;
