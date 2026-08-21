"use server";

import webpush from "web-push";
import { getWebPushPublicKey, getWebPushSubject, isWebPushConfigured } from "@/core/utils/webPush/vapid";
import { getNotificationSettingsRuntimeAction } from "@/modules/admin/actions/settings.action";
import {
  countActiveWebPushSubscriptionsQuery,
  deleteOtherWebPushSubscriptionsQuery,
  deleteWebPushSubscriptionByIdQuery,
  deleteWebPushSubscriptionQuery,
  disableWebPushSubscriptionsQuery,
  findActiveWebPushSubscriptionsByUserQuery,
  upsertWebPushSubscriptionQuery,
} from "./web-push.query";

type RegisterWebPushSubscriptionParams = {
  userId: number;
  endpoint: string;
  p256dh?: string | null;
  auth?: string | null;
  userAgent?: string | null;
};

type WebPushNotificationParams = {
  userId: number;
  uuid?: string | null;
  type?: string | null;
  title?: string | null;
  content?: string | null;
  linkUrl?: string | null;
  imageUrl?: string | null;
};

const configureWebPush = () => {
  const publicKey = getWebPushPublicKey();
  const privateKey = process.env.WEB_PUSH_VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) return false;

  webpush.setVapidDetails(
    getWebPushSubject(),
    publicKey,
    privateKey
  );

  return true;
};

export const registerWebPushSubscriptionAction = async ({
  userId,
  endpoint,
  p256dh,
  auth,
  userAgent,
}: RegisterWebPushSubscriptionParams) => {
  const settings = await getNotificationSettingsRuntimeAction();
  if (!settings.webPushEnabled) return { success: false, skipped: "web_push_disabled" };

  await upsertWebPushSubscriptionQuery({
    userId,
    endpoint,
    p256dh: p256dh || null,
    auth: auth || null,
    userAgent: userAgent || null,
  });

  return { success: true };
};

export const unregisterWebPushSubscriptionAction = async (userId: number, endpoint: string) => {
  await deleteWebPushSubscriptionQuery(userId, endpoint);
  return { success: true };
};

export const unregisterWebPushSubscriptionByIdAction = async (userId: number, id: number) => {
  await deleteWebPushSubscriptionByIdQuery(userId, id);
  return { success: true };
};

export const unregisterOtherWebPushSubscriptionsAction = async (userId: number, currentEndpoint: string) => {
  await deleteOtherWebPushSubscriptionsQuery(userId, currentEndpoint);
  return { success: true };
};

export const sendWebPushNotificationAction = async ({
  userId,
  uuid,
  type,
  title,
  content,
  linkUrl,
  imageUrl,
}: WebPushNotificationParams) => {
  const settings = await getNotificationSettingsRuntimeAction();
  if (!settings.webPushEnabled) return { success: false, skipped: "web_push_disabled" };
  if (!isWebPushConfigured() || !configureWebPush()) return { success: false, skipped: "web_push_not_configured" };

  const rows = await findActiveWebPushSubscriptionsByUserQuery(userId);
  if (rows.length === 0) return { success: true, sent: 0 };

  let successCount = 0;
  const invalidEndpoints: string[] = [];
  const payload = JSON.stringify({
    type: "notification",
    notificationType: type || "info",
      notificationId: uuid || "",
      title: title || "새 알림",
      body: content || "새로운 알림이 도착했습니다.",
      icon: imageUrl || "/icon-192.png",
      badge: "/icon-192.png",
      linkUrl: linkUrl || "/user/notifications",
  });

  for (const row of rows) {
    try {
      await webpush.sendNotification({
        endpoint: row.endpoint,
        keys: {
          p256dh: row.p256dh || "",
          auth: row.auth || "",
        },
      }, payload, {
        TTL: 120,
      });
      successCount += 1;
      console.info("sendWebPushNotificationAction delivered:", {
        userId,
        notificationId: uuid || "",
        subscriptionId: row.id,
      });
    } catch (error: any) {
      const statusCode = Number(error?.statusCode || error?.status);

      if (statusCode === 404 || statusCode === 410) {
        invalidEndpoints.push(row.endpoint);
      } else {
        console.error("sendWebPushNotificationAction delivery failed:", {
          statusCode,
          body: error?.body,
          message: error?.message,
        });
      }
    }
  }

  await disableWebPushSubscriptionsQuery(invalidEndpoints);

  return {
    success: true,
    sent: successCount,
    disabled: invalidEndpoints.length,
  };
};

export const getWebPushRuntimeStatusAction = async (currentOrigin?: string) => {
  const settings = await getNotificationSettingsRuntimeAction();
  let subscriptionCount = 0;

  try {
    subscriptionCount = await countActiveWebPushSubscriptionsQuery();
  } catch (error) {
    console.warn("getWebPushRuntimeStatusAction subscription count skipped:", error);
  }

  const isSecureContext = Boolean(currentOrigin?.startsWith("https://") || currentOrigin?.startsWith("http://localhost") || currentOrigin?.startsWith("http://127.0.0.1"));

  return {
    pwa: {
      enabled: settings.pwaEnabled,
      manifest: settings.pwaEnabled,
      serviceWorker: settings.pwaEnabled,
      icons: settings.pwaEnabled,
      secureContext: isSecureContext,
    },
    webPush: {
      enabled: settings.webPushEnabled,
      configured: settings.webPushEnabled && isWebPushConfigured(),
      publicKey: Boolean(getWebPushPublicKey()),
      privateKey: Boolean(process.env.WEB_PUSH_VAPID_PRIVATE_KEY),
      subject: getWebPushSubject(),
      activeSubscriptions: subscriptionCount,
    },
    fcmPush: {
      enabled: settings.fcmPushEnabled,
      projectId: Boolean(process.env.FIREBASE_PROJECT_ID),
      credentials: Boolean(
        process.env.GOOGLE_APPLICATION_CREDENTIALS ||
        process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 ||
        process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
        (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY)
      ),
    },
  };
};
