"use client";

import { useEffect, useState } from "react";
import { MonitorSmartphone, RefreshCw, Smartphone, Trash2 } from "lucide-react";

type WebPushSubscriptionItem = {
  id: number;
  endpoint: string;
  endpointPreview: string;
  userAgent: string;
  isActive: boolean;
  failureCount: number;
  lastSeenAt?: string;
  createdAt?: string;
};

type BrowserPushState = {
  serviceWorker: boolean;
  pushManager: boolean;
  notification: boolean;
  badge: boolean;
  permission: NotificationPermission | "unsupported";
  subscribed: boolean;
  activeSubscriptions: number;
  currentEndpoint: string;
};

const defaultState: BrowserPushState = {
  serviceWorker: false,
  pushManager: false,
  notification: false,
  badge: false,
  permission: "unsupported",
  subscribed: false,
  activeSubscriptions: 0,
  currentEndpoint: "",
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

const StatusPill = ({ ok, label }: { ok: boolean; label: string }) => {
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

const getDeviceLabel = (userAgent: string) => {
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /Chrome\//.test(userAgent)
      ? "Chrome"
      : /Safari\//.test(userAgent)
        ? "Safari"
        : /Firefox\//.test(userAgent)
          ? "Firefox"
          : "브라우저";
  const os = /Mac OS X|Macintosh/.test(userAgent)
    ? "macOS"
    : /Windows/.test(userAgent)
      ? "Windows"
      : /Android/.test(userAgent)
        ? "Android"
        : /iPhone|iPad/.test(userAgent)
          ? "iOS"
          : "기기";

  return `${browser} · ${os}`;
};

const formatDateTime = (value?: string) => {
  if (!value) return "기록 없음";

  try {
    return new Intl.DateTimeFormat("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "기록 없음";
  }
};

const WebPushPreferencePanel = () => {
  const [state, setState] = useState<BrowserPushState>(defaultState);
  const [subscriptions, setSubscriptions] = useState<WebPushSubscriptionItem[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const refreshState = async () => {
    if (typeof window === "undefined" || typeof navigator === "undefined") return;

    const serviceWorker = "serviceWorker" in navigator;
    const pushManager = "PushManager" in window;
    const notification = "Notification" in window;
    const badge = "setAppBadge" in navigator || "clearAppBadge" in navigator;
    let subscribed = false;
    let activeSubscriptions = 0;
    let currentEndpoint = "";

    if (serviceWorker && pushManager) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        subscribed = Boolean(subscription);
        currentEndpoint = subscription?.endpoint || "";
      } catch {
        subscribed = false;
        currentEndpoint = "";
      }
    }

    try {
      const response = await fetch("/api/web-push/subscriptions", {
        credentials: "include",
        cache: "no-store",
      });
      const result = await response.json();
      activeSubscriptions = Number(result?.activeSubscriptions || 0);
      setSubscriptions(Array.isArray(result?.subscriptions) ? result.subscriptions : []);
    } catch {
      activeSubscriptions = 0;
      setSubscriptions([]);
    }

    setState({
      serviceWorker,
      pushManager,
      notification,
      badge,
      permission: notification ? Notification.permission : "unsupported",
      subscribed,
      activeSubscriptions,
      currentEndpoint,
    });
  };

  const enableWebPush = async () => {
    setBusy(true);
    setMessage(null);

    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        setMessage({ type: "error", text: "현재 브라우저는 브라우저 알림을 지원하지 않습니다." });
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        await refreshState();
        setMessage({ type: "error", text: "브라우저 알림 권한이 허용되지 않았습니다." });
        return;
      }

      const keyResponse = await fetch("/api/web-push/vapid-public-key", {
        credentials: "include",
        cache: "no-store",
      });
      const keyResult = await keyResponse.json();

      if (!keyResponse.ok || !keyResult?.publicKey) {
        setMessage({ type: "error", text: keyResult?.message || "브라우저 알림 키를 불러오지 못했습니다." });
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
        setMessage({ type: "error", text: saveResult?.message || "브라우저 알림 등록에 실패했습니다." });
        return;
      }

      await refreshState();
      setMessage({ type: "success", text: "이 브라우저에서 알림을 받을 수 있습니다." });
    } catch (error) {
      console.error("Web Push preference enable failed:", error);
      setMessage({ type: "error", text: "브라우저 알림을 켜는 중 오류가 발생했습니다." });
    } finally {
      setBusy(false);
    }
  };

  const disableWebPush = async () => {
    setBusy(true);
    setMessage(null);

    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        await refreshState();
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

      await refreshState();
      setMessage({ type: "success", text: "이 브라우저의 알림 구독을 해제했습니다." });
    } catch (error) {
      console.error("Web Push preference disable failed:", error);
      setMessage({ type: "error", text: "브라우저 알림을 끄는 중 오류가 발생했습니다." });
    } finally {
      setBusy(false);
    }
  };

  const removeSubscription = async (id: number) => {
    setRemovingId(id);
    setMessage(null);

    try {
      const target = subscriptions.find((item) => item.id === id);
      const response = await fetch("/api/web-push/subscriptions", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        setMessage({ type: "error", text: result?.message || "등록 기기 제거에 실패했습니다." });
        return;
      }

      if (target?.endpoint && target.endpoint === state.currentEndpoint && "serviceWorker" in navigator && "PushManager" in window) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        await subscription?.unsubscribe();
      }

      await refreshState();
      setMessage({ type: "success", text: "등록 기기를 제거했습니다." });
    } catch (error) {
      console.error("Web Push subscription remove failed:", error);
      setMessage({ type: "error", text: "등록 기기 제거 중 오류가 발생했습니다." });
    } finally {
      setRemovingId(null);
    }
  };

  const removeOtherSubscriptions = async () => {
    if (!state.currentEndpoint) {
      setMessage({ type: "error", text: "현재 브라우저 구독을 먼저 확인해주세요." });
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch("/api/web-push/subscriptions", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mode: "others", endpoint: state.currentEndpoint }),
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        setMessage({ type: "error", text: result?.message || "다른 등록 기기 제거에 실패했습니다." });
        return;
      }

      await refreshState();
      setMessage({ type: "success", text: "이 브라우저를 제외한 등록 기기를 제거했습니다." });
    } catch (error) {
      console.error("Other Web Push subscriptions remove failed:", error);
      setMessage({ type: "error", text: "다른 등록 기기를 제거하는 중 오류가 발생했습니다." });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    refreshState();
  }, []);

  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-dark-800 dark:bg-dark-950">
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
              권한: {state.permission} · 상태: {state.subscribed ? "구독됨" : "미구독"} · 등록 기기 {state.activeSubscriptions}개
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          <button
            type="button"
            onClick={refreshState}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 dark:border-dark-700 dark:bg-dark-900 dark:text-dark-300 dark:hover:bg-dark-800"
            aria-label="브라우저 알림 상태 새로고침"
          >
            <RefreshCw size={14} />
          </button>
          {state.subscribed ? (
            <button
              type="button"
              onClick={disableWebPush}
              disabled={busy}
              className="rounded-full bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-dark-100 dark:text-dark-950 dark:hover:bg-white"
            >
              알림 끄기
            </button>
          ) : (
            <button
              type="button"
              onClick={enableWebPush}
              disabled={busy}
              className="rounded-full bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-dark-100 dark:text-dark-950 dark:hover:bg-white"
            >
              알림 켜기
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <StatusPill ok={state.serviceWorker} label="Service Worker" />
        <StatusPill ok={state.pushManager} label="Push" />
        <StatusPill ok={state.notification} label="Notification" />
        <StatusPill ok={state.badge} label="Badge" />
      </div>

      {message && (
        <div className={`mt-3 rounded-md px-3 py-2 text-xs leading-5 ${
          message.type === "success"
            ? "bg-white text-gray-600 dark:bg-dark-900 dark:text-dark-200"
            : "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-300"
        }`}>
          {message.text}
        </div>
      )}

      <div className="mt-5 border-t border-gray-200 pt-4 dark:border-dark-800">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-dark-500">Registered Devices</div>
            <p className="mt-1 text-xs leading-5 text-gray-400 dark:text-dark-400">
              이 계정으로 브라우저 알림을 받을 수 있는 등록 기기입니다.
            </p>
          </div>
          <button
            type="button"
            onClick={removeOtherSubscriptions}
            disabled={busy || !state.subscribed || subscriptions.length < 2}
            className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-700 dark:bg-dark-900 dark:text-dark-300 dark:hover:bg-dark-800"
          >
            이 기기 제외 모두 제거
          </button>
        </div>

        <div className="mt-3 grid gap-2">
          {subscriptions.length === 0 ? (
            <div className="rounded-md border border-dashed border-gray-200 bg-white px-3 py-4 text-xs text-gray-400 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-500">
              등록된 브라우저 알림 기기가 없습니다.
            </div>
          ) : subscriptions.map((item) => {
            const isCurrent = item.endpoint === state.currentEndpoint;

            return (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-3 dark:border-dark-800 dark:bg-dark-900 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-dark-800 dark:text-dark-300">
                    <MonitorSmartphone size={15} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-dark-100">{getDeviceLabel(item.userAgent)}</span>
                      {isCurrent && (
                        <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-bold text-white dark:bg-dark-100 dark:text-dark-950">
                          현재 기기
                        </span>
                      )}
                      {!item.isActive && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-400 dark:bg-dark-800 dark:text-dark-500">
                          비활성
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-[11px] text-gray-400 dark:text-dark-500">{item.endpointPreview}</p>
                    <p className="mt-1 text-[11px] text-gray-400 dark:text-dark-500">
                      마지막 확인 {formatDateTime(item.lastSeenAt)} · 실패 {item.failureCount}회
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeSubscription(item.id)}
                  disabled={removingId === item.id}
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-gray-200 px-3 text-xs font-bold text-gray-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-700 dark:text-dark-300 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                >
                  <Trash2 size={13} />
                  제거
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WebPushPreferencePanel;
