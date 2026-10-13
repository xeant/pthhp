"use server";

import { revalidatePath } from "next/cache";
import * as query from "./notification.query";
import { getNotificationSettingsRuntimeAction } from "@/modules/admin/actions/settings.action";
import { getSettingsByKeysQuery } from "@/modules/admin/actions/settings.query";
import { notificationEvents } from "@/core/utils/trigger/notificationEvents";
import { findUserPreferenceByUserId } from "@/modules/user/actions/preference.query";
import { sendPushNotificationAction } from "./push.action";
import { sendWebPushNotificationAction } from "./web-push.action";

function extractTiptapText(nodes: any[]): string {
  return nodes
    .map((node) => {
      if (node.type === "text" && node.text) return node.text;
      if (Array.isArray(node.content)) return extractTiptapText(node.content);
      return "";
    })
    .filter(Boolean)
    .join(" ");
}

function findTiptapImage(nodes: any[]): string | null {
  for (const node of nodes) {
    if (node.type === "image" && node.attrs?.src) return node.attrs.src;
    if (Array.isArray(node.content)) {
      const nested = findTiptapImage(node.content);
      if (nested) return nested;
    }
  }

  return null;
}

function normalizeNotificationContent(content?: string | null): { content: string; imageUrl: string | null } {
  if (!content) return { content: "", imageUrl: null };

  const cleanText = (text: string) => text
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  try {
    let parsed = JSON.parse(content);
    if (typeof parsed === "string") parsed = JSON.parse(parsed);

    if (parsed?.type === "doc" && Array.isArray(parsed.content)) {
      const imageUrl = findTiptapImage(parsed.content);
      const text = cleanText(extractTiptapText(parsed.content));

      return {
        content: text || (imageUrl ? "이미지 댓글입니다." : ""),
        imageUrl,
      };
    }

    if (Array.isArray(parsed?.blocks)) {
      const imageBlock = parsed.blocks.find((block: any) => block?.type === "image");
      const imageUrl = imageBlock?.data?.file?.url || null;
      const text = cleanText(
        parsed.blocks
          .map((block: any) => block?.data?.text || block?.data?.caption || "")
          .join(" ")
      );

      return {
        content: text || (imageUrl ? "이미지 댓글입니다." : ""),
        imageUrl,
      };
    }
  } catch (e) {
    const imageUrl = content.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] || null;
    const text = cleanText(content);

    return {
      content: text || (imageUrl ? "이미지 댓글입니다." : ""),
      imageUrl,
    };
  }

  return {
    content: cleanText(content),
    imageUrl: null,
  };
}

/** 🌟 [SAVE] */
export const saveNotification = async (data: any) => {
  // data 안에 userId, type, title, content, metadata 등이 다 들어있어야 합니다.
  const normalized = normalizeNotificationContent(data.content);
  const result = await query.insertNotification({
    ...data,
    content: normalized.content,
    imageUrl: data.imageUrl || normalized.imageUrl,
    isRead: false,
  });
  return result;
};

const toBool = (value: unknown, fallback = true) => {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return fallback;
};

const getCommentReplySubscription = async (commentId?: number | string | null) => {
  if (!commentId) return true;

  try {
    const records = await getSettingsByKeysQuery([`notification.commentReply.${commentId}`]);
    return toBool(records[0]?.value, true);
  } catch {
    return true;
  }
};

const isNotificationTypeEnabled = async (data: any) => {
  const settings = await getNotificationSettingsRuntimeAction();
  const subType = data?.subType || data?.metadata?.subType;
  const userPreference = data.userId ? await findUserPreferenceByUserId(Number(data.userId)) : null;

  if (subType === "comment") {
    if (!settings.commentNotificationsEnabled) return { enabled: false, settings };
    if (userPreference && !userPreference.notifyComments) return { enabled: false, settings };
    if (!toBool(data.documentNotificationEnabled, true)) return { enabled: false, settings };
  }

  if (subType === "reply") {
    if (!settings.replyNotificationsEnabled) return { enabled: false, settings };
    if (userPreference && !userPreference.notifyReplies) return { enabled: false, settings };
    const subscribed = await getCommentReplySubscription(data.parentId);
    if (!subscribed) return { enabled: false, settings };
  }

  if (["document", "attachment", "admin-comment"].includes(subType)) {
    if (!settings.adminContentNotificationsEnabled) return { enabled: false, settings };
    if (userPreference && !userPreference.notifyAdmin) return { enabled: false, settings };
  }

  if (subType === "force-logout") {
    if (!settings.forceLogoutNotificationsEnabled) return { enabled: false, settings };
    if (userPreference && !userPreference.notifyAdmin) return { enabled: false, settings };
  }

  if (settings.excludeSelfNotifications && data.actorId && data.userId && String(data.actorId) === String(data.userId)) {
    return { enabled: false, settings };
  }

  return { enabled: true, settings };
};

export const dispatchNotificationAction = async (data: any, context?: any) => {
  const actorId = context?.user?.id ?? data?.actorId;
  const targetId = data?.userId;

  if (!targetId) return null;

  try {
    const { enabled, settings } = await isNotificationTypeEnabled({ ...data, actorId });
    if (!enabled) return null;

    const notification = await saveNotification({
      ...data,
      actorId,
      metadata: {
        ...(data.metadata || {}),
        ...(data.subType ? { subType: data.subType } : {}),
      },
      imageUrl: settings.showNotificationThumbnails ? data.imageUrl : null,
    });

    if (settings.realtimeNotificationsEnabled) {
      notificationEvents.emit("new-notification", {
        ...notification,
        showToast: settings.toastNotificationsEnabled,
        imageUrl: settings.showNotificationThumbnails ? notification.imageUrl : null,
      });
    }

    sendPushNotificationAction({
      userId: notification.userId,
      uuid: notification.uuid,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      linkUrl: notification.linkUrl,
    }).catch((error) => {
      console.error("sendPushNotificationAction Error:", error);
    });

    sendWebPushNotificationAction({
      userId: notification.userId,
      uuid: notification.uuid,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      linkUrl: notification.linkUrl,
      imageUrl: notification.imageUrl,
    }).catch((error) => {
      console.error("sendWebPushNotificationAction Error:", error);
    });

    return notification;
  } catch (error) {
    console.error("dispatchNotificationAction Error:", error);
    return null;
  }
};

export const createLoginNotificationAction = async ({
  userId,
  source = "web",
}: {
  userId: number;
  source?: "web" | "mobile" | "qr";
}) => {
  const sourceLabel = source === "mobile" ? "앱" : source === "qr" ? "QR 로그인" : "웹";

  try {
    const notification = await saveNotification({
      userId,
      type: "info",
      title: "로그인 알림",
      content: `${sourceLabel}에서 로그인되었습니다.`,
      linkUrl: "/user/notifications",
      metadata: {
        subType: "login",
        source,
      },
    });

    notificationEvents.emit("new-notification", {
      ...notification,
      showToast: true,
      imageUrl: null,
    });

    sendPushNotificationAction({
      userId: notification.userId,
      uuid: notification.uuid,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      linkUrl: notification.linkUrl,
    }).catch((error) => {
      console.error("sendPushNotificationAction Error:", error);
    });

    sendWebPushNotificationAction({
      userId: notification.userId,
      uuid: notification.uuid,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      linkUrl: notification.linkUrl,
      imageUrl: notification.imageUrl,
    }).catch((error) => {
      console.error("sendWebPushNotificationAction Error:", error);
    });

    return notification;
  } catch (error) {
    console.error("createLoginNotificationAction Error:", error);
    return null;
  }
};

/** 🌟 [GET] */
export const getUnreadCount = async (userId: number) => {
  return await query.findUnreadCount(userId);
};

export const getUnreadList = async (userId: number) => {
  const settings = await getNotificationSettingsRuntimeAction();
  return await query.findUnreadList(userId, settings.unreadPreviewLimit);
};

export const findHistoryPage = async (userId: number, skip: number, take: number) => {
  // 쿼리 레이어(notification.query.ts)에 있는 동명의 함수를 호출합니다.
  return await query.findHistoryPage(userId, skip, take);
};

/** 🌟 [UPDATE] */
export const setReadStatus = async (uuid: string, userId: number) => {
  // 💡 보안 팁: 단순히 UUID로만 업데이트하지 말고,
  // '내 알림이 맞는지(userId)' 확인하는 로직을 query 단에 넣는 게 좋습니다.
  await query.updateReadStatus(uuid, userId);

  const newCount = await query.findUnreadCount(userId);
  return { success: true, newCount };
};

// 💡 프론트엔드/API에서 setReadAll로 불렀다면 이름을 맞춰주는 게 좋겠죠?
export const setAllRead = async (userId: number) => {
  await query.updateAllToRead(userId);
  return { success: true, newCount: 0 };
};

/** 🌟 [REMOVE] */
export const removeNotification = async (uuid: string, userId: number) => {
  // 💡 보안 팁: 남이 내 알림을 지우지 못하도록 userId를 같이 넘깁니다.
  await query.deleteByUuid(uuid, userId);

  // 리스트와 카운트를 동시에 돌려주는 건 아주 좋은 설계입니다! (Optimistic UI 대응)
  const latestUnread = await query.findUnreadList(userId);
  const newCount = await query.findUnreadCount(userId);

  return { success: true, latestUnread, newCount };
};

export const deleteAllNotifications = async (userId: number) => {
  // 쿼리 레이어의 delete 함수 호출
  return await query.deleteAllByUserId(userId);
};
