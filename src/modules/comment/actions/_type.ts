import { Prisma, PermissionSubject } from "@core/utils/db/generated/client";
import { ActionResponse } from "@/core/types/actions";
import { z } from "zod";
import {contentBaseRule} from "@/modules/posts/actions/_type";

export type { ActionResponse };

export type ActionState<T = any> = ActionResponse<T>;



/**
 * 안전한 댓글 객체
 * 클라이언트에 전달하기 전 authorPassword를 제외(Omit)한 기본 타입입니다.
 */
export interface CommentInfo extends Omit<PrismaCommentWithRelations, 'authorPassword'> {}

/**
 * 최종 계층형 댓글 타입
 * CommentInfo의 children(Prisma 타입)을 제거하고,
 * 재귀적으로 본인 타입(CommentWithChildren)의 배열로 재정의합니다.
 */
export interface CommentWithChildren extends Omit<CommentInfo, 'children'> {
  userName?: string | null;
  children: CommentWithChildren[]; // ✅ 재귀적 구조
}

/**
 * 댓글 페이지네이션 응답 타입
 */
export interface CommentListResponse {
  items: CommentWithChildren[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}



// 📌 [Comment] 댓글 원본 타입
export type PrismaCommentWithRelations = Prisma.CommentGetPayload<{
  include: {
    user: { select: { id: true, nickName: true, profile: true } },
    children: true, // 대댓글
  }
}>;

// 💡 안전한 댓글 객체 (비회원 댓글 비밀번호 제외)
export interface CommentInfo extends Omit<PrismaCommentWithRelations, 'authorPassword'> {}



// ------------------------------------------
// 📝 [Comment] 댓글 스키마
// ------------------------------------------
export const CommentUpsertSchema = z.object({
  id: z.coerce.number().optional(),
  documentId: z.coerce.number(), // 어떤 게시글의 댓글인지
  parentId: z.coerce.number().optional().nullable(), // 대댓글인 경우 부모 ID
  content: contentBaseRule,

  isSecret: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional().default(false),

  // 비회원 작성용
  authorName: z.string().optional().nullable(),
  authorPassword: z.string().optional().nullable(),
});
export type CommentParams = z.infer<typeof CommentUpsertSchema>;

