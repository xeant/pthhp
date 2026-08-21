// src/app/(extentions)/posts/_actions/comment.action.ts
"use server";

import { revalidatePath } from "next/cache";
import * as query from "./comment.query";
import { ActionState, CommentWithChildren, CommentListResponse } from "./_type";
import { withTrigger } from "@utils/trigger/triggerWrapper";
import { cookies } from "next/headers";
import { verify } from "@utils/auth/jwtAuth";
import {nanoid} from "nanoid";
import { upsertSettingsQuery } from "@/modules/admin/actions/settings.query";
import crypto from "crypto";


async function getLoggedInfo() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) return null;
  const verified = await verify(accessToken);
  if (!verified?.id) return null;
  return { id: verified.id, isAdmin: Boolean(verified.isAdmin) };
}

function isOwnerOnlyBoard(config: any) {
  return Boolean(config?.consultingState);
}

function getSecretCookieName(slug: string) {
  return `post_secret_${slug}`;
}

function createSecretCookieValue(slug: string) {
  const secret = process.env.SECRET_KEY || process.env.JWT_SECRET || "plextype-secret";
  return crypto.createHmac("sha256", secret).update(`post:${slug}`).digest("hex");
}

async function hasSecretDocumentCookie(slug: string) {
  const cookieStore = await cookies();
  return cookieStore.get(getSecretCookieName(slug))?.value === createSecretCookieValue(slug);
}

async function canAccessDocumentComments(documentId: number) {
  const document = await query.findDocumentCommentAccessInfo(documentId);
  if (!document) return { allowed: false, message: "존재하지 않는 게시글입니다." };

  const loggedInfo = await getLoggedInfo();

  if (
    document.isSecrets &&
    document.userId !== loggedInfo?.id &&
    !loggedInfo?.isAdmin &&
    !(await hasSecretDocumentCookie(document.slug))
  ) {
    return { allowed: false, message: "비밀글 댓글을 조회할 권한이 없습니다." };
  }

  if (!isOwnerOnlyBoard(document.module?.config)) {
    return { allowed: true, document };
  }

  if (document.userId === loggedInfo?.id || loggedInfo?.isAdmin) {
    return { allowed: true, document };
  }

  return { allowed: false, message: "댓글을 조회할 권한이 없습니다." };
}

// [GET] 댓글 목록 조회
export async function getCommentsAction(documentId: number, page: number = 1, pageSize: number = 10): Promise<ActionState<CommentListResponse>> {
  try {
    const access = await canAccessDocumentComments(documentId);
    if (!access.allowed) return { success: false, type: "error", message: access.message || "댓글을 조회할 권한이 없습니다." };

    const totalCount = await query.countRootComments(documentId);
    const rootComments = await query.findRootComments(documentId, page, pageSize);
    const rootIds = rootComments.map(rc => rc.id);
    const childComments = await query.findChildComments(documentId, rootIds);

    const items: CommentWithChildren[] = rootComments.map(rc => ({
      ...rc,
      userName: rc.user?.nickName ?? null,
      createdAt: rc.createdAt.toISOString(),
      updatedAt: rc.updatedAt.toISOString(),
      children: childComments
        .filter(cc => cc.parentId === rc.id)
        .map(cc => ({
          ...cc,
          userName: cc.user?.nickName ?? null,
          createdAt: cc.createdAt.toISOString(),
          updatedAt: cc.updatedAt.toISOString(),
          children: []
        }))
    })) as any;

    return {
      success: true, message: "조회 성공",
      data: { items, pagination: { totalCount, totalPages: Math.ceil(totalCount / pageSize), currentPage: page, pageSize } }
    };
  } catch (error) {
    return { success: false, message: "조회 실패" };
  }
}

// [SAVE] 원본의 addComment + addCommentAndIncrementCount 통합
export const saveCommentAction = withTrigger("comment.saved", async (formData: FormData, paths?: string): Promise<ActionState<CommentWithChildren>> => {
  console.log("🚀 saveCommentAction 시작됨!");
  try {
    const loggedInfo = await getLoggedInfo();
    if (!loggedInfo) return { success: false, message: "로그인 필요" };

    const id = formData.get("id") ? Number(formData.get("id")) : null;
    const documentId = Number(formData.get("documentId"));
    const content = formData.get("content") as string;
    const parentId = formData.get("parentId") ? Number(formData.get("parentId")) : null;
    const notificationEnabledValue = formData.get("notificationEnabled");
    const notificationEnabled = notificationEnabledValue !== "false";

    const access = await canAccessDocumentComments(documentId);
    if (!access.allowed) return { success: false, type: "error", message: "댓글을 작성할 권한이 없습니다." };

    let result;
    if (id) {
      const comment = await query.findCommentById(id);
      if (!comment) return { success: false, type: "error", message: "댓글이 없습니다." };
      if (comment.documentId !== documentId) return { success: false, type: "error", message: "댓글 정보가 올바르지 않습니다." };
      if (comment.userId !== loggedInfo.id && !loggedInfo.isAdmin) {
        return { success: false, type: "error", message: "댓글을 수정할 권한이 없습니다." };
      }

      // 수정 (원본 updateComment 로직)
      result = await query.updateComment(id, { content });
      if (notificationEnabledValue !== null) {
        await upsertSettingsQuery([{
          key: `notification.commentReply.${id}`,
          value: String(notificationEnabled),
          group: "notification-subscription",
          label: "댓글 답글 알림 수신",
          description: "이 댓글에 답글이 달렸을 때 작성자가 알림을 받을지 정합니다.",
          isPublic: false,
        }]);
      }
    } else {
      // 등록 (원본 addComment 로직)
      let depth = 0;
      let finalParentId = parentId;
      if (parentId) {
        const parent = await query.findCommentById(parentId);
        finalParentId = parent?.parentId ?? parent?.id ?? null;
        depth = (parent?.depth ?? 0) + 1;
      }
      const slug =  nanoid(10);
      result = await query.insertComment({ content, documentId, userId: loggedInfo.id, parentId: finalParentId, depth , slug});
      console.log(result)
      console.log("🔥 DB 저장 직후 결과:", JSON.stringify(result, null, 2));
      await upsertSettingsQuery([{
        key: `notification.commentReply.${result.id}`,
        value: String(notificationEnabled),
        group: "notification-subscription",
        label: "댓글 답글 알림 수신",
        description: "이 댓글에 답글이 달렸을 때 작성자가 알림을 받을지 정합니다.",
        isPublic: false,
      }]);
      // ✅ 여기서 원본의 addCommentAndIncrementCount 로직 실행
      await query.incrementDocumentCommentCount(documentId);
    }

    if (paths) revalidatePath(paths);
    return { success: true, message: "저장 완료", data: { ...result, userName: result.user?.nickName, createdAt: result.createdAt.toISOString(), updatedAt: result.updatedAt.toISOString(), children: [] } as any };
  } catch (error) {
    return { success: false, message: "저장 실패" };
  }
});

// [REMOVE] 원본의 deleteComment + deleteCommentAndDecrementCount 통합
export async function removeCommentAction(documentId: number, commentId: number, paths?: string): Promise<ActionState<null>> {
  try {
    const loggedInfo = await getLoggedInfo();
    if (!loggedInfo) return { success: false, type: "error", message: "로그인이 필요합니다." };

    const comment = await query.findCommentById(commentId);
    if (!comment) return { success: false, message: "댓글 없음" };
    if (comment.documentId !== documentId) return { success: false, type: "error", message: "댓글 정보가 올바르지 않습니다." };
    if (comment.userId !== loggedInfo.id && !loggedInfo.isAdmin) {
      return { success: false, type: "error", message: "댓글을 삭제할 권한이 없습니다." };
    }

    const childCount = comment._count?.children ?? 0;
    if (childCount > 0) {
      // 소프트 삭제 (자식이 있는 경우)
      await query.updateComment(commentId, { content: "해당 댓글은 삭제되었습니다.", isDeleted: true });
    } else {
      // 실제 삭제 (자식이 없는 경우)
      await query.deleteComment(commentId);
    }

    // ✅ 여기서 원본의 deleteCommentAndDecrementCount 로직 실행
    await query.decrementDocumentCommentCount(documentId);

    if (paths) revalidatePath(paths);
    return { success: true, message: "삭제 완료" };
  } catch (error) {
    return { success: false, message: "삭제 실패" };
  }
}

// 참여자 조회 액션
export async function getParticipantsAction(documentId: number): Promise<ActionState<any[]>> {
  try {
    const access = await canAccessDocumentComments(documentId);
    if (!access.allowed) return { success: false, type: "error", message: access.message || "댓글 참여자를 조회할 권한이 없습니다.", data: [] };

    const members = await query.findParticipants(documentId);
    return { success: true, message: "조회 성공", data: members.map(m => m.user).filter(Boolean) };
  } catch (error) {
    return { success: false, message: "조회 실패" };
  }
}
