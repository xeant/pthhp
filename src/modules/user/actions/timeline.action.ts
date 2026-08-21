"use server";

import { ActionState } from "@/modules/admin/actions/_type";
import { getUserSessionAction } from "@/modules/user/actions/user.action";
import { findUserById } from "@/modules/user/actions/user.query";
import {
  countUserTimelineSummaryQuery,
  findUserTimelineAttachmentsQuery,
  findUserTimelineCommentsQuery,
  findUserTimelineDocumentsQuery,
  findUserTimelineNotificationsQuery,
} from "./timeline.query";

export type UserTimelineKind = "document" | "comment" | "attachment" | "notification";
export type UserTimelineFilter = "all" | UserTimelineKind;

export interface UserTimelineItem {
  id: string;
  kind: UserTimelineKind;
  title: string;
  description: string;
  href?: string | null;
  imageUrl?: string | null;
  createdAt: Date;
  meta: string;
  status?: string | null;
}

export interface UserTimelineData {
  user: {
    id: number;
    accountId: string;
    nickName: string;
    email: string;
    profileImage: string | null;
  };
  summary: {
    documentCount: number;
    commentCount: number;
    attachmentCount: number;
    notificationCount: number;
    unreadNotificationCount: number;
  };
  items: UserTimelineItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

const cleanText = (text: string) => text
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const extractTiptapText = (nodes: any[]): string => {
  return nodes
    .map((node) => {
      if (node.type === "text" && node.text) return node.text;
      if (Array.isArray(node.content)) return extractTiptapText(node.content);
      return "";
    })
    .filter(Boolean)
    .join(" ");
};

const toPreview = (content?: string | null, fallback = "내용이 없습니다.") => {
  if (!content) return fallback;

  try {
    let parsed = JSON.parse(content);
    if (typeof parsed === "string") parsed = JSON.parse(parsed);

    if (parsed?.type === "doc" && Array.isArray(parsed.content)) {
      const text = cleanText(extractTiptapText(parsed.content));
      return text || fallback;
    }

    if (Array.isArray(parsed?.blocks)) {
      const text = cleanText(parsed.blocks.map((block: any) => block?.data?.text || block?.data?.caption || "").join(" "));
      return text || fallback;
    }
  } catch {
    const text = cleanText(content);
    return text || fallback;
  }

  return fallback;
};

const trimPreview = (text: string, maxLength = 120) => {
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
};

const formatFileSize = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

const parseCursor = (cursor?: string | null) => {
  if (!cursor) return null;

  const date = new Date(cursor);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getTimelineData = async ({
  user,
  cursor,
  limit,
  filter,
}: {
  user: {
    id: number;
    accountId: string;
    nickName: string;
    email_address: string;
    profile?: { profileImage?: string | null } | null;
  };
  cursor?: string | null;
  limit: number;
  filter: UserTimelineFilter;
}): Promise<UserTimelineData> => {
  const userId = user.id;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 30) : 15;
  const cursorDate = parseCursor(cursor);
  const queryTake = safeLimit + 1;

  const shouldLoadDocuments = filter === "all" || filter === "document";
  const shouldLoadComments = filter === "all" || filter === "comment";
  const shouldLoadAttachments = filter === "all" || filter === "attachment";
  const shouldLoadNotifications = filter === "all" || filter === "notification";

  const [summary, documents, comments, attachments, notifications] = await Promise.all([
    countUserTimelineSummaryQuery(userId),
    shouldLoadDocuments ? findUserTimelineDocumentsQuery(userId, queryTake, cursorDate) : Promise.resolve([]),
    shouldLoadComments ? findUserTimelineCommentsQuery(userId, queryTake, cursorDate) : Promise.resolve([]),
    shouldLoadAttachments ? findUserTimelineAttachmentsQuery(userId, queryTake, cursorDate) : Promise.resolve([]),
    shouldLoadNotifications ? findUserTimelineNotificationsQuery(userId, queryTake, cursorDate) : Promise.resolve([]),
  ]);

  const documentItems: UserTimelineItem[] = documents.map((document) => ({
    id: `document-${document.id}`,
    kind: "document",
    title: document.title || "제목 없는 게시글",
    description: trimPreview(toPreview(document.content, "본문 미리보기가 없습니다.")),
    href: `/posts/${document.module.mid}/${document.slug}`,
    imageUrl: document.thumbnail,
    createdAt: document.createdAt,
    meta: `${document.module.moduleName} · 조회 ${document.readCount || 0} · 댓글 ${document.commentCount || 0}`,
    status: document.status || "published",
  }));

  const commentItems: UserTimelineItem[] = comments.map((comment) => ({
    id: `comment-${comment.id}`,
    kind: "comment",
    title: comment.document.title || "제목 없는 게시글",
    description: comment.isDeleted
      ? "삭제된 댓글입니다."
      : trimPreview(toPreview(comment.content, "댓글 내용이 없습니다.")),
    href: `/posts/${comment.document.module.mid}/${comment.document.slug}`,
    imageUrl: null,
    createdAt: comment.createdAt,
    meta: `${comment.document.module.moduleName} · ${comment.depth > 0 ? "답글" : "댓글"}`,
    status: comment.isSecret ? "secret" : "normal",
  }));

  const attachmentItems: UserTimelineItem[] = attachments.map((attachment) => ({
    id: `attachment-${attachment.id}`,
    kind: "attachment",
    title: attachment.originalName || attachment.fileName,
    description: `${attachment.mimeType} · ${formatFileSize(attachment.size)}`,
    href: attachment.path,
    imageUrl: attachment.mimeType.startsWith("image/") ? attachment.path : null,
    createdAt: attachment.createdAt,
    meta: "첨부파일 업로드",
    status: attachment.mimeType,
  }));

  const notificationItems: UserTimelineItem[] = notifications.map((notification) => ({
    id: `notification-${notification.id}`,
    kind: "notification",
    title: notification.title || "알림",
    description: trimPreview(notification.content || "알림 내용이 없습니다."),
    href: notification.linkUrl,
    imageUrl: notification.imageUrl,
    createdAt: notification.createdAt,
    meta: notification.isRead ? "읽은 알림" : "읽지 않은 알림",
    status: notification.type,
  }));

  const items = [
    ...documentItems,
    ...commentItems,
    ...attachmentItems,
    ...notificationItems,
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const pagedItems = items.slice(0, safeLimit);
  const lastItem = pagedItems[pagedItems.length - 1];

  return {
    user: {
      id: user.id,
      accountId: user.accountId,
      nickName: user.nickName,
      email: user.email_address,
      profileImage: user.profile?.profileImage || null,
    },
    summary,
    items: pagedItems,
    nextCursor: lastItem ? new Date(lastItem.createdAt).toISOString() : null,
    hasMore: items.length > safeLimit,
  };
};

export const getUserTimelineAction = async (
  cursor?: string | null,
  limit = 15,
  filter: UserTimelineFilter = "all",
): Promise<ActionState<UserTimelineData>> => {
  const session = await getUserSessionAction();

  if (!session.success || !session.data) {
    return {
      success: false,
      type: "error",
      message: "로그인이 필요합니다.",
    };
  }

  try {
    return {
      success: true,
      type: "success",
      message: "타임라인 조회 성공",
      data: await getTimelineData({ user: session.data, cursor, limit, filter }),
    };
  } catch (error) {
    console.error("getUserTimelineAction Error:", error);
    return {
      success: false,
      type: "error",
      message: "타임라인을 불러오지 못했습니다.",
    };
  }
};

export const getUserTimelineAdminAction = async (
  userId: number,
  cursor?: string | null,
  limit = 15,
  filter: UserTimelineFilter = "all",
): Promise<ActionState<UserTimelineData>> => {
  const session = await getUserSessionAction();

  if (!session.success || !session.data?.isAdmin) {
    return {
      success: false,
      type: "error",
      message: "관리자 권한이 필요합니다.",
    };
  }

  try {
    const targetUser = await findUserById(userId);
    if (!targetUser) {
      return {
        success: false,
        type: "error",
        message: "회원을 찾을 수 없습니다.",
      };
    }

    return {
      success: true,
      type: "success",
      message: "회원 타임라인 조회 성공",
      data: await getTimelineData({ user: targetUser, cursor, limit, filter }),
    };
  } catch (error) {
    console.error("getUserTimelineAdminAction Error:", error);
    return {
      success: false,
      type: "error",
      message: "회원 타임라인을 불러오지 못했습니다.",
    };
  }
};
