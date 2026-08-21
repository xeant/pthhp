// src/hooks/notification/useRealtimeNotification.ts
import { useEffect, useState } from "react";
import { useToastStore } from "@/core/store/useToastStore";
import { hasClientSession } from "@/core/utils/auth/clientAuth";

// src/hooks/notification/useRealtimeNotification.ts

export function useRealtimeNotification(userId: string | number | undefined) {
  const addToast = useToastStore((state) => state.addToast);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!userId) return; // 로그인 안 했으면 연결 안 함

    let active = true;
    let eventSource: EventSource | null = null;
    let retryTimer: number | undefined;

    const connect = async () => {
      const hasSession = await hasClientSession();
      if (!active || !hasSession) return;

      eventSource = new EventSource(`/api/notifications/stream`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.showToast !== false) {
            addToast(data.content, "info", {
              title: data.title,
              imageUrl: data.imageUrl,
              linkUrl: data.linkUrl,
            });
          }

          window.dispatchEvent(new Event('refresh-unread'));
        } catch (err) {
          console.error("SSE 파싱 에러:", err);
        }
      };

      eventSource.onerror = async () => {
        eventSource?.close();
        eventSource = null;

        const canRetry = await hasClientSession();
        if (active && canRetry) {
          retryTimer = window.setTimeout(() => {
            setRetryKey((prev) => prev + 1);
          }, 5000);
        }
      };
    };

    connect();

    return () => {
      active = false;
      eventSource?.close();
      if (retryTimer) window.clearTimeout(retryTimer);
    };
  }, [userId, addToast, retryKey]);
}
