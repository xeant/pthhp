"use server";

import { revalidatePath } from "next/cache";

import { deleteAttachmentAction } from "@/modules/attachment/actions/attachment.action";
import { removeCommentAction } from "@/modules/comment/actions/comment.action";
import { removeDocumentAction } from "@/modules/document/actions/document.action";
import { dispatchNotificationAction } from "@/modules/notification/actions/notification.action";
import { getUserSessionAction } from "@/modules/user/actions/user.action";
import { ActionState } from "@/modules/admin/actions/_type";
import {
  findAttachmentDeleteTargetAdminQuery,
  findCommentDeleteTargetAdminQuery,
  findDocumentDeleteTargetAdminQuery,
  findRecentAttachmentsAdminQuery,
  findRecentCommentsAdminQuery,
  findRecentDocumentsAdminQuery,
} from "./content.query";

export interface AdminDocumentListItem {
  id: number;
  slug: string;
  title: string;
  preview: string;
  status: string | null;
  published: boolean | null;
  isNotice: boolean | null;
  isSecrets: boolean | null;
  readCount: number | null;
  commentCount: number | null;
  createdAt: Date;
  updatedAt: Date;
  module: {
    id: number;
    mid: string;
    moduleName: string;
  };
  category: {
    id: number;
    title: string;
  } | null;
  user: {
    id: number;
    nickName: string;
    accountId: string;
    profile: {
      profileImage: string | null;
    } | null;
  } | null;
}

export interface AdminDocumentListData {
  items: AdminDocumentListItem[];
  navigation: {
    totalCount: number;
    totalPages: number;
    page: number;
    listCount: number;
  };
}

export interface AdminCommentListItem {
  id: number;
  uuid: string;
  slug: string;
  content: string;
  isDeleted: boolean;
  isSecret: boolean;
  status: string | null;
  depth: number;
  parentId: number | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    nickName: string;
    accountId: string;
    profile: {
      profileImage: string | null;
    } | null;
  } | null;
  document: {
    id: number;
    slug: string;
    title: string | null;
    module: {
      id: number;
      mid: string;
      moduleName: string;
    };
  };
}

export interface AdminCommentListData {
  items: AdminCommentListItem[];
  navigation: {
    totalCount: number;
    totalPages: number;
    page: number;
    listCount: number;
  };
}

export interface AdminAttachmentListItem {
  id: number;
  uuid: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  status: string | null;
  createdAt: Date;
  updatedAt: Date;
  uploadedBy: {
    id: number;
    nickName: string;
    accountId: string;
    profile: {
      profileImage: string | null;
    } | null;
  } | null;
}

export interface AdminAttachmentListData {
  items: AdminAttachmentListItem[];
  navigation: {
    totalCount: number;
    totalPages: number;
    page: number;
    listCount: number;
  };
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

const toPreview = (content?: string | null) => {
  if (!content) return "";

  try {
    let parsed = JSON.parse(content);
    if (typeof parsed === "string") parsed = JSON.parse(parsed);

    if (parsed?.type === "doc" && Array.isArray(parsed.content)) {
      const text = cleanText(extractTiptapText(parsed.content));
      return text.length > 90 ? `${text.slice(0, 90).trim()}...` : text;
    }

    if (Array.isArray(parsed?.blocks)) {
      const text = cleanText(parsed.blocks.map((block: any) => block?.data?.text || block?.data?.caption || "").join(" "));
      return text.length > 90 ? `${text.slice(0, 90).trim()}...` : text;
    }
  } catch {
    const text = cleanText(content);
    return text.length > 90 ? `${text.slice(0, 90).trim()}...` : text;
  }

  return "";
};

const getAdminSession = async () => {
  const sessionInfo = await getUserSessionAction();
  if (!sessionInfo?.data?.isAdmin) return null;
  return sessionInfo.data;
};

const notifyDeletedOwner = async ({
  userId,
  actorId,
  title,
  content,
  linkUrl,
  contentType,
}: {
  userId: number | null;
  actorId: number;
  title: string;
  content: string;
  linkUrl?: string;
  contentType: "document" | "comment" | "attachment";
}) => {
  if (!userId || userId === actorId) return;

  await dispatchNotificationAction({
    userId,
    actorId,
    type: "warning",
    title,
    content,
    linkUrl,
    metadata: {
      appId: "gjworks",
      groupKey: "ADMIN_CONTENT",
      subType: contentType === "comment" ? "admin-comment" : contentType,
    },
  });
};

export const getRecentDocumentsAdminAction = async (
  page = 1,
  pageSize = 20,
): Promise<ActionState<AdminDocumentListData>> => {
  const sessionInfo = await getUserSessionAction();

  if (!sessionInfo?.data?.isAdmin) {
    return {
      success: false,
      type: "error",
      message: "관리자 권한이 필요합니다.",
    };
  }

  try {
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20;
    const { items, totalCount } = await findRecentDocumentsAdminQuery(safePage, safePageSize);
    const formattedItems = items.map((item) => ({
      ...item,
      title: item.title || "제목 없음",
      preview: toPreview(item.content),
    }));

    return {
      success: true,
      type: "success",
      message: "최근 게시글 조회 성공",
      data: {
        items: formattedItems,
        navigation: {
          totalCount,
          totalPages: Math.ceil(totalCount / safePageSize),
          page: safePage,
          listCount: formattedItems.length,
        },
      },
    };
  } catch (error) {
    console.error("getRecentDocumentsAdminAction Error:", error);
    return {
      success: false,
      type: "error",
      message: "최근 게시글을 불러오지 못했습니다.",
    };
  }
};

export const removeDocumentAdminAction = async (documentId: number): Promise<ActionState<null>> => {
  const admin = await getAdminSession();

  if (!admin) {
    return {
      success: false,
      type: "error",
      message: "관리자 권한이 필요합니다.",
    };
  }

  try {
    const target = await findDocumentDeleteTargetAdminQuery(documentId);
    if (!target) {
      return { success: false, type: "error", message: "삭제할 게시글을 찾을 수 없습니다." };
    }

    const result = await removeDocumentAction(documentId, target.module.mid);
    if (!result.success) return { success: false, type: "error", message: result.message || "게시글 삭제에 실패했습니다." };

    await notifyDeletedOwner({
      userId: target.userId,
      actorId: admin.id,
      title: "게시글이 관리자에 의해 삭제되었습니다.",
      content: `${target.title || "제목 없음"} 게시글이 운영 정책에 따라 삭제되었습니다.`,
      linkUrl: `/posts/${target.module.mid}`,
      contentType: "document",
    });

    revalidatePath("/admin/content/documents");
    revalidatePath("/admin/content");

    return { success: true, type: "success", message: "게시글을 삭제했습니다." };
  } catch (error) {
    console.error("removeDocumentAdminAction Error:", error);
    return { success: false, type: "error", message: "게시글 삭제 중 오류가 발생했습니다." };
  }
};

export const getRecentCommentsAdminAction = async (
  page = 1,
  pageSize = 20,
): Promise<ActionState<AdminCommentListData>> => {
  const sessionInfo = await getUserSessionAction();

  if (!sessionInfo?.data?.isAdmin) {
    return {
      success: false,
      type: "error",
      message: "관리자 권한이 필요합니다.",
    };
  }

  try {
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 20;
    const { items, totalCount } = await findRecentCommentsAdminQuery(safePage, safePageSize);
    const formattedItems = items.map((item) => ({
      ...item,
      content: toPreview(item.content) || (item.isDeleted ? "삭제된 댓글입니다." : "내용 없음"),
    }));

    return {
      success: true,
      type: "success",
      message: "최근 댓글 조회 성공",
      data: {
        items: formattedItems,
        navigation: {
          totalCount,
          totalPages: Math.ceil(totalCount / safePageSize),
          page: safePage,
          listCount: formattedItems.length,
        },
      },
    };
  } catch (error) {
    console.error("getRecentCommentsAdminAction Error:", error);
    return {
      success: false,
      type: "error",
      message: "최근 댓글을 불러오지 못했습니다.",
    };
  }
};

export const removeCommentAdminAction = async (commentId: number): Promise<ActionState<null>> => {
  const admin = await getAdminSession();

  if (!admin) {
    return {
      success: false,
      type: "error",
      message: "관리자 권한이 필요합니다.",
    };
  }

  try {
    const target = await findCommentDeleteTargetAdminQuery(commentId);
    if (!target) {
      return { success: false, type: "error", message: "삭제할 댓글을 찾을 수 없습니다." };
    }

    const postPath = `/posts/${target.document.module.mid}/${target.document.slug}`;
    const result = await removeCommentAction(target.documentId, commentId, postPath);
    if (!result.success) return { success: false, type: "error", message: result.message || "댓글 삭제에 실패했습니다." };

    await notifyDeletedOwner({
      userId: target.userId,
      actorId: admin.id,
      title: "댓글이 관리자에 의해 삭제되었습니다.",
      content: `${target.document.title || "게시글"}에 작성한 댓글이 운영 정책에 따라 삭제되었습니다. ${toPreview(target.content)}`,
      linkUrl: postPath,
      contentType: "comment",
    });

    revalidatePath("/admin/content/comments");
    revalidatePath("/admin/content");

    return { success: true, type: "success", message: "댓글을 삭제했습니다." };
  } catch (error) {
    console.error("removeCommentAdminAction Error:", error);
    return { success: false, type: "error", message: "댓글 삭제 중 오류가 발생했습니다." };
  }
};

export const getRecentAttachmentsAdminAction = async (
  page = 1,
  pageSize = 24,
): Promise<ActionState<AdminAttachmentListData>> => {
  const sessionInfo = await getUserSessionAction();

  if (!sessionInfo?.data?.isAdmin) {
    return {
      success: false,
      type: "error",
      message: "관리자 권한이 필요합니다.",
    };
  }

  try {
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 24;
    const { items, totalCount } = await findRecentAttachmentsAdminQuery(safePage, safePageSize);

    return {
      success: true,
      type: "success",
      message: "최근 첨부파일 조회 성공",
      data: {
        items,
        navigation: {
          totalCount,
          totalPages: Math.ceil(totalCount / safePageSize),
          page: safePage,
          listCount: items.length,
        },
      },
    };
  } catch (error) {
    console.error("getRecentAttachmentsAdminAction Error:", error);
    return {
      success: false,
      type: "error",
      message: "최근 첨부파일을 불러오지 못했습니다.",
    };
  }
};

export const removeAttachmentAdminAction = async (attachmentId: number): Promise<ActionState<null>> => {
  const admin = await getAdminSession();

  if (!admin) {
    return {
      success: false,
      type: "error",
      message: "관리자 권한이 필요합니다.",
    };
  }

  try {
    const target = await findAttachmentDeleteTargetAdminQuery(attachmentId);
    if (!target) {
      return { success: false, type: "error", message: "삭제할 첨부파일을 찾을 수 없습니다." };
    }

    const result = await deleteAttachmentAction(attachmentId);
    if (!result.success) return { success: false, type: "error", message: result.message || "첨부파일 삭제에 실패했습니다." };

    await notifyDeletedOwner({
      userId: target.userId,
      actorId: admin.id,
      title: "첨부파일이 관리자에 의해 삭제되었습니다.",
      content: `${target.originalName || target.fileName} 파일이 운영 정책에 따라 삭제되었습니다.`,
      contentType: "attachment",
    });

    revalidatePath("/admin/content/attachments");
    revalidatePath("/admin/content");

    return { success: true, type: "success", message: "첨부파일과 실제 파일을 삭제했습니다." };
  } catch (error) {
    console.error("removeAttachmentAdminAction Error:", error);
    return { success: false, type: "error", message: "첨부파일 삭제 중 오류가 발생했습니다." };
  }
};
