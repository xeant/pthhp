const serviceWorkerSource = `
const NOTIFICATION_URL = "/user/notifications";

const readLatestNotification = async () => {
  try {
    const response = await fetch("/api/notifications/unread", {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) return null;
    const items = await response.json();
    return Array.isArray(items) ? items[0] : null;
  } catch (error) {
    return null;
  }
};

const updateBadge = async () => {
  try {
    const response = await fetch("/api/notifications/count", {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      if ("clearAppBadge" in self.registration) {
        await self.registration.clearAppBadge();
      }
      return;
    }
    const data = await response.json();
    const count = Number(data && data.count ? data.count : 0);

    if ("setAppBadge" in self.registration && count > 0) {
      await self.registration.setAppBadge(count);
    } else if ("clearAppBadge" in self.registration) {
      await self.registration.clearAppBadge();
    }
  } catch (error) {
  }
};

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request));
});

self.addEventListener("push", (event) => {
  event.waitUntil((async () => {
    await updateBadge();
    let payload = null;

    try {
      payload = event.data ? event.data.json() : null;
    } catch (error) {
      payload = null;
    }

    const latest = payload ? null : await readLatestNotification();
    const title = payload && payload.title ? payload.title : latest && latest.title ? latest.title : "새 알림";
    const body = payload && payload.body ? payload.body : latest && latest.content ? latest.content : "새로운 알림이 도착했습니다.";
    const targetUrl = payload && payload.linkUrl ? payload.linkUrl : latest && latest.linkUrl ? latest.linkUrl : NOTIFICATION_URL;
    const icon = payload && payload.icon ? payload.icon : "/icon-192.png";
    const badge = payload && payload.badge ? payload.badge : "/icon-192.png";
    const tag = payload && payload.notificationId ? payload.notificationId : latest && latest.uuid ? latest.uuid : "app-notification";

    await self.registration.showNotification(title, {
      body,
      icon,
      badge,
      data: {
        url: targetUrl,
      },
      tag,
    });
  })());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data && event.notification.data.url ? event.notification.data.url : NOTIFICATION_URL, self.location.origin).href;

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });

    const sameOriginWindows = windows.filter((client) => {
      try {
        return new URL(client.url).origin === self.location.origin;
      } catch (error) {
        return false;
      }
    });

    for (const client of sameOriginWindows) {
      if ("focus" in client && "navigate" in client) {
        await client.focus();
        await client.navigate(targetUrl);
        return;
      }
    }

    await self.clients.openWindow(targetUrl);
  })());
});
`;

export async function GET() {
  return new Response(serviceWorkerSource, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Service-Worker-Allowed": "/",
      "Cache-Control": "no-store",
    },
  });
}
