import { Prisma, PermissionSubject } from "@core/utils/db/generated/client";
import { ActionResponse } from "@/core/types/actions";
import { z } from "zod";
import {contentBaseRule, titleBaseRule} from "@/modules/posts/actions/_type";

export type { ActionResponse };

export type ActionState<T = any> = ActionResponse<T>;

// 📌 [Document] 게시글 원본 타입 (작성자, 카테고리, 첨부파일 포함)
export type PrismaDocumentWithRelations = Prisma.DocumentGetPayload<{
  include: {
    user: { select: { id: true, nickName: true, email_address: true, profile: true } },
    category: true,
    // attachments: true,
  }
}>;

export const DocumentUpsertSchema = z.object({
  id: z.coerce.number().optional(),
  categoryId: z.coerce.number().optional().nullable(),
  title: titleBaseRule,
  content: contentBaseRule.optional().nullable(), // 에디터를 쓰면 빈 값이 넘어올 수도 있음

  thumbnail: z.string().optional().nullable(),

  // 💡 체크박스 값("true" / "false")을 완벽하게 boolean으로 파싱
  isNotice: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional().default(false),
  isSecrets: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional().default(false),
  secretPassword: z.string().optional().nullable(),

  moduleId: z.coerce.number(),
  moduleType: z.string().default("posts"),

  // 💡 비회원 작성용 (로그인 안 한 사용자가 글을 쓸 때)
  authorName: z.string().optional().nullable(),
  authorPassword: z.string().optional().nullable(),

  extraFieldData: z.record(z.string(), z.any()).optional(),
});
export type DocumentParams = z.infer<typeof DocumentUpsertSchema>;


// 💡 안전한 게시글 객체 (비밀글 비밀번호 등 민감정보 제외)
export interface DocumentInfo extends Omit<PrismaDocumentWithRelations, 'authorPassword'> {
  extraFieldData: ExtraFieldData | any;
}

export interface ExtraFieldData {
  [key: string]: string | string[] | number | boolean | null | any;
}
