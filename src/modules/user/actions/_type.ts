import { Prisma } from "@core/utils/db/generated/client";
import { ActionResponse } from "@/core/types/actions";
import { z } from "zod";

export type { ActionResponse }; // 외부에서 쓸 수 있게 다시 내보내기

// ==========================================
// 🧩 [공통 검증 룰 (모듈화)] - 정책이 바뀌면 여기만 수정하세요!
// ==========================================
export const passwordBaseRule = z
  .string()
  .min(1, "비밀번호를 입력해주세요.")
;

export const accountIdBaseRule = z
  .string()
  .min(4, "아이디는 4자 이상이어야 합니다.")
  .max(20)
  .regex(/^[a-zA-Z0-9]+$/, "아이디는 영문과 숫자만 사용할 수 있습니다.");


// ==========================================
// 1. [Output] 서버 -> 클라이언트 (응답용 데이터 타입)
// ==========================================

// 📌 공통 액션 상태 (Generic)
export type ActionState<T = any> = ActionResponse<T>;

// 📌 [User] DB 원본 타입 (관계 포함)
export type PrismaUserWithRelations = Prisma.UserGetPayload<{
  include: {
    profile: true;
    userGroups: { include: { group: true } };
  }
}>;

// 📌 [User] 클라이언트에 전달할 안전한 유저 객체
export interface UserInfo extends Omit<PrismaUserWithRelations, 'password' | 'refreshToken'> {}

// 📌 [User] 유저 목록 응답 데이터
export interface UserListResponseData {
  userList: UserInfo[];
  navigation: {
    totalCount: number;
    totalPages: number;
    page: number;
    listCount: number;
  };
}

// 📌 [Group] 그룹 응답 데이터
export interface GroupInfo {
  id?: number | null;
  groupName: string;
  groupTitle: string;
  groupDesc?: string | null;
  groupDefault?: boolean;
}


// ==========================================
// 2. [Input] 클라이언트 -> 서버 (요청/검증용 스키마 & 파라미터)
// ==========================================

// 📌 [User] 목록 검색 파라미터
export const UserListSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  keyword: z.string().nullable().transform(val => val?.trim() || null),
  target: z.enum(["accountId", "nickName", "email_address"]).default("accountId"),
  status: z.enum(["active", "pending", "blocked"]).optional(),
  listCount: z.coerce.number().min(1).max(100).default(20),
});
export type UserListParams = z.input<typeof UserListSchema>; // 입력용 (문자열 허용)
export type UserListParsedParams = z.infer<typeof UserListSchema>; // 파싱 완료용 (숫자 고정)


// 📌 [User] 생성 및 수정 폼 데이터 (Upsert)
export const UserUpsertSchema = z.object({
  id: z.coerce.number().optional(),
  uuid: z.string().nullable().optional(),
  accountId: accountIdBaseRule, // 💡 만들어둔 공통 룰 적용!
  email_address: z.string().email("유효한 이메일 형식이 아닙니다."),
  nickName: z.string().min(2, "닉네임은 2자 이상이어야 합니다."),

  // 💡 공통 비밀번호 룰 적용 (수정 시 빈 값 허용)
  password: passwordBaseRule.optional().or(z.literal("")),

  isAdmin: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
  status: z.enum(["active", "pending", "blocked"]).optional(),
  group: z.array(z.object({ groupId: z.string() })).optional(),
});
export type UserParams = z.infer<typeof UserUpsertSchema>;


// 📌 [User] 비밀번호 변경 전용 폼 데이터 (새로 추가됨!)
export const PasswordChangeSchema = z.object({
  nowPassword: z.string().min(1, "현재 비밀번호를 입력해주세요."),
  newPassword: passwordBaseRule, // 💡 여기서도 공통 비밀번호 룰 완벽 재사용!
});
export type PasswordChangeParams = z.infer<typeof PasswordChangeSchema>;


// 📌 [Group] 생성 및 수정 폼 데이터 (Upsert)
export const GroupUpsertSchema = z.object({
  groupId: z.coerce.number().optional().nullable(),
  groupName: z.string().min(2, "그룹ID(영문)는 2자 이상 입력해주세요."),
  groupTitle: z.string().min(2, "그룹명은 2자 이상 입력해주세요."),
  groupDesc: z.string().optional().nullable(),
});
export type GroupParams = z.infer<typeof GroupUpsertSchema>;


// ==========================================
// 3. [Auth] 인증/세션 정보
// ==========================================

// 📌 [JWT] 디코딩용 세션 데이터
export const SessionSchema = z.object({
  id: z.number(),
  accountId: z.string(),
  isAdmin: z.boolean().default(false).optional(),
});
export type LoggedParams = z.infer<typeof SessionSchema>;

export const PasswordVerifySchema = z.object({
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});
export type PasswordVerifyParams = z.infer<typeof PasswordVerifySchema>;
