"use client";

import { useEffect } from "react";
import { useUserContext } from "@/core/providers/UserProvider";
import { clearPwaAppBadge, setPwaAppBadge } from "@/core/utils/pwa/appBadge";

const syncAppBadge = async () => {
  if (typeof navigator === "undefined") return;

  try {
    const response = await fetch("/api/notifications/count", {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      await clearPwaAppBadge();
      return;
    }

    const data = await response.json();
    const count = Number(data?.count || 0);
    await setPwaAppBadge(count);
  } catch {
  }
};

export default function PwaWebPushBootstrap({ enabled = true }: { enabled?: boolean }) {
  const { user, isLoading } = useUserContext();

  useEffect(() => {
    if (!enabled) return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
      console.error("PWA service worker register failed:", error);
    });
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      clearPwaAppBadge();
      return;
    }
    if (isLoading) return;
    if (!user?.id) {
      clearPwaAppBadge();
      return;
    }

    syncAppBadge();

    const handleRefresh = () => {
      syncAppBadge();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) syncAppBadge();
    };

    window.addEventListener("refresh-unread", handleRefresh);
    window.addEventListener("focus", handleRefresh);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("refresh-unread", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, isLoading, user?.id]);

  return null;
}
