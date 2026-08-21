import { Prisma, PermissionSubject } from "@core/utils/db/generated/client";
import { ActionResponse } from "@/core/types/actions";
import { z } from "zod";

export type { ActionResponse };

// ==========================================
// 🧩 [공통 검증 룰 (모듈화)]
// ==========================================
export const titleBaseRule = z
  .string()
  .min(2, "제목은 2자 이상 입력해주세요.")
  .max(255, "제목은 255자를 넘을 수 없습니다.");

export const contentBaseRule = z
  .string()
  .min(2, "내용을 입력해주세요.");


// ==========================================
// 1. [Output] 서버 -> 클라이언트 (응답용 데이터 타입)
// ==========================================

// 📌 공통 액션 상태 (Generic)
export type ActionState<T = any> = ActionResponse<T>;

// 📌 [Posts] 게시판(설정) 원본 타입
export type PrismaPostsInfo = Prisma.ModulesGetPayload<{}>;
export interface PostsInfo extends PrismaPostsInfo {}

// 📌 [Document] 게시글 원본 타입 (작성자, 카테고리, 첨부파일 포함)
export type PrismaDocumentWithRelations = Prisma.DocumentGetPayload<{
  include: {
    user: { select: { id: true, nickName: true, email_address: true, profile: true } },
    category: true,
    attachments: true,
  }
}>;

// 💡 안전한 게시글 객체 (비밀글 비밀번호 등 민감정보 제외)
export interface DocumentInfo extends Omit<PrismaDocumentWithRelations, 'authorPassword'> {
  extraFieldData: ExtraFieldData | any;
}

// 📌 [Document] 게시글 목록 응답 데이터 (페이지네이션)
export interface DocumentListResponseData {
  documentList: DocumentInfo[];
  navigation: {
    totalCount: number;
    totalPages: number;
    page: number;
    listCount: number;
  };
}

// ==========================================
// 2. [Input] 클라이언트 -> 서버 (요청/검증용 스키마 & 파라미터)
// ==========================================

// ------------------------------------------
// 📝 [Posts] 게시판 자체 (Board) 스키마
// ------------------------------------------
export const PostsUpsertSchema = z.object({
  id: z.coerce.number().optional(),
  mid: z
    .string()
    .min(2, "게시판 ID는 최소 2글자 이상이어야 합니다.")
    .regex(/^[a-zA-Z0-9]+$/, "게시판 ID는 영문과 숫자만 입력 가능합니다."),
  moduleName: z.string().min(2, "게시판 이름을 입력해주세요."),
  moduleDesc: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  // 💡 JSON 데이터는 어떤 구조가 올지 모르므로 기본적으로 any 처리 후, 필요시 구체화합니다.
  grant: z.any().optional(),
  config: z.any().optional(),
});
export type PostsParams = z.infer<typeof PostsUpsertSchema>;

// ------------------------------------------
// 📝 [Document] 게시글 (Article) 스키마
// ------------------------------------------
export const DocumentListSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  keyword: z.string().nullable().transform(val => val?.trim() || null),
  target: z.enum(["title", "content", "authorName"]).default("title"),
  listCount: z.coerce.number().min(1).max(100).default(20),
  categoryId: z.coerce.number().optional().nullable(),
  moduleId: z.coerce.number(), // 어떤 게시판(Posts)에 속하는지
  moduleType: z.string().default("posts"),
});
export type DocumentListParams = z.input<typeof DocumentListSchema>;
export type DocumentListParsedParams = z.infer<typeof DocumentListSchema>;




// ------------------------------------------
// 📝 [Category] 게시판 카테고리 스키마
// ------------------------------------------
// src/app/(modules)/posts/_actions/_type.ts (또는 해당 파일)

export const CategoryUpsertSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, "카테고리명을 입력해주세요."),
  slug: z.string().optional().nullable(),
  desc: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  order: z.coerce.number().default(0),
  parentId: z.coerce.number().optional().nullable(),

  // 🌟 여기서 필드명을 바꿔줘야 합니다!
  moduleId: z.coerce.number(),
  moduleType: z.string().default("posts"),
});

// 이제 CategoryParams 타입에도 moduleId가 자동으로 포함됩니다!
export type CategoryParams = z.infer<typeof CategoryUpsertSchema>;


export interface PostInfoData {
  id: number;
  mid: string;
  moduleName: string;
  moduleDesc: string | null;
  // 💡 데이터 구조를 config 주머니가 있는 모양으로 바꿉니다!
  config: {
    skin?: string;
    layout?: string;
    listCount: number;
    pageCount: number;
    documentLike: boolean;
    consultingState: boolean;
    secretPost?: boolean;
  };
  permissions: {
    listPermissions: any[];
    readPermissions: any[];
    writePermissions: any[];
    commentPermissions: any[];
  };
}


// 📌 [Permission] 기본 데이터 타입
export type PermissionData = {
  id?: number;
  moduleType: string; // 예: "posts"
  moduleId: number;
  action: string; // "read", "write", "list", "comment"
  subjectType: PermissionSubject; // "GUEST", "MEMBER", "ADMIN", "GROUP" 등 (Prisma Enum)
  subjectId?: number;
};

// 📌 [UI/Logic용] 권한 정보 구조
export interface Permission {
  subjectType: string; // "guest" | "member" | "admin" | "group"
  subjectId?: number | null;
}

// 📌 [Permission Set] 리소스별 권한 집합
export interface Permissions {
  listPermissions: Permission[];
  readPermissions: Permission[];
  writePermissions: Permission[];
  commentPermissions: Permission[];
}

// 📌 [Auth] 현재 사용자 세션 정보 타입
export interface CurrentUser {
  id: number;
  accountId: string;
  isAdmin: boolean;
  groups: number[]; // 사용자가 속한 그룹 ID 배열
  loggedIn: boolean;
}

export interface TreeItem {
  id: string;
  title: string;
  slug: string | null;
  moduleId: number;
  moduleType: string;
  parentId: string | null;
  children: TreeItem[];
  order: number;
}

export interface ExtraFieldConfig {
  [key: string]: any; // 💡 인덱스 시그니처 추가
  name: string;
  label: string;
  type: 'text' | 'tags' | 'number' | 'date' | 'select';
  required?: boolean;
  options?: string[];
}

// 2. 게시물에 저장될 실제 데이터 타입 (K-V 쌍)
export interface ExtraFieldData {
  [key: string]: string | string[] | number | boolean | null | any;
}
