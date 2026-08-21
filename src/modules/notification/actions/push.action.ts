"use server";

import { getFirebaseMessaging } from "@/core/utils/firebase/admin";
import { getNotificationSettingsRuntimeAction } from "@/modules/admin/actions/settings.action";
import {
  disablePushTokenQuery,
  disablePushTokensQuery,
  findActivePushTokensByUserQuery,
  upsertPushTokenQuery,
} from "./push.query";

type RegisterPushTokenParams = {
  userId: number;
  token: string;
  platform: string;
  deviceName?: string | null;
};

type PushNotificationParams = {
  userId: number;
  uuid: string;
  type?: string | null;
  title?: string | null;
  content?: string | null;
  linkUrl?: string | null;
};

const INVALID_TOKEN_ERROR_CODES = new Set([
  "messaging/invalid-registration-token",
  "messaging/registration-token-not-registered",
]);

const chunk = <T,>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

export const registerPushTokenAction = async ({
  userId,
  token,
  platform,
  deviceName,
}: RegisterPushTokenParams) => {
  const settings = await getNotificationSettingsRuntimeAction();
  if (!settings.fcmPushEnabled) return { success: false, skipped: "fcm_push_disabled" };

  await upsertPushTokenQuery({
    userId,
    token,
    platform: platform || "android",
    deviceName: deviceName || null,
  });

  return { success: true };
};

export const unregisterPushTokenAction = async (userId: number, token: string) => {
  await disablePushTokenQuery(userId, token);
  return { success: true };
};

export const sendPushNotificationAction = async ({
  userId,
  uuid,
  type,
  title,
  content,
  linkUrl,
}: PushNotificationParams) => {
  const settings = await getNotificationSettingsRuntimeAction();
  if (!settings.fcmPushEnabled) return { success: false, skipped: "fcm_push_disabled" };

  const messaging = getFirebaseMessaging();
  if (!messaging) return { success: false, skipped: "firebase_not_configured" };

  const rows = await findActivePushTokensByUserQuery(userId);
  const tokens = rows.map((row) => row.token).filter(Boolean);
  if (tokens.length === 0) return { success: true, sent: 0 };

  let successCount = 0;
  const invalidTokens: string[] = [];

  for (const tokenChunk of chunk(tokens, 500)) {
    const response = await messaging.sendEachForMulticast({
      tokens: tokenChunk,
      notification: {
        title: title || "새 알림",
        body: content || "새로운 알림이 도착했습니다.",
      },
      data: {
        type: "notification",
        notificationType: type || "info",
        notificationId: uuid,
        linkUrl: linkUrl || "",
      },
      android: {
        priority: "high",
        notification: {
          channelId: process.env.FCM_ANDROID_CHANNEL_ID || "default_notifications",
        },
      },
    });

    successCount += response.successCount;
    response.responses.forEach((item, index) => {
      const code = item.error?.code;
      if (code && INVALID_TOKEN_ERROR_CODES.has(code)) {
        invalidTokens.push(tokenChunk[index]);
      }
    });
  }

  await disablePushTokensQuery(invalidTokens);

  return {
    success: true,
    sent: successCount,
    disabled: invalidTokens.length,
  };
};
