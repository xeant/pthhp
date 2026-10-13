// src/app/(extentions)/users/_actions/user.action.ts
"use server";

import { cookies } from "next/headers";
import { hashedPassword, verifyPassword } from "@utils/auth/password";
import { saveUser, removeUser, getUserList, decodeUserToken, getUserSession } from "./user";
import { ActionState, UserUpsertSchema, PasswordChangeSchema, UserListParams, UserListSchema, UserListResponseData, LoggedParams, UserInfo, UserParams, PasswordVerifySchema } from "./_type";
import * as query from "./user.query"; // 분리된 쿼리 함수 임포트
import { validateForm } from "@utils/validation/formValidator";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { getAuthSettingsRuntimeAction, validatePasswordByAuthSettings } from "@/modules/admin/actions/auth-settings";
import redisClient from "@utils/redis/redis";
/**
 * 💡 공통 유틸: Prisma 결과물에서 민감한 정보(비밀번호 등) 제외하기
 */
function excludeSensitiveData(user: any): UserInfo {
  const { password, refreshToken, ...safeUser } = user;
  return safeUser as UserInfo;
}

// ==========================================
// [ACTION] 유저 등록 / 수정 (Zod 파싱 적용)
// ==========================================
export const saveUserAction = async (formData: FormData, paths?: string): Promise<ActionState<any>> => {
  // 1. 웹 전용 데이터(isProfileUpdate) 추출
  const isProfileUpdate = formData.get("isProfileUpdate") === "true";
  const loggedInfo = await getLoggedUserAction();
  const targetId = formData.get("id") ? Number(formData.get("id")) : undefined;
  const isAdminRequest = loggedInfo.isAdmin === true;

  if (targetId && !isAdminRequest && loggedInfo.id !== targetId) {
    return { success: false, type: "error", message: "회원 정보를 수정할 권한이 없습니다." };
  }

  let safeIsAdmin = false;
  if (isAdminRequest) {
    safeIsAdmin = formData.get("isAdmin") === "true";
  } else if (targetId) {
    const existingUser = await query.findUserById(targetId);
    if (!existingUser) return { success: false, type: "error", message: "회원정보가 없습니다." };
    safeIsAdmin = Boolean(existingUser.isAdmin);
  }

  const formPayload = {
    id: targetId,
    accountId: formData.get("accountId")?.toString() || "",
    slug: formData.get("slug")?.toString() || nanoid(10),
    email_address: formData.get("email_address")?.toString() || "",
    nickName: formData.get("nickName")?.toString() || "",
    password: formData.get("password")?.toString() || "",
    isAdmin: safeIsAdmin,
    status: isAdminRequest ? formData.get("status")?.toString() : undefined,
    group: isAdminRequest ? formData.getAll("groups[]").map(g => ({ groupId: g })) : undefined,
  };

  // 2. Zod 유효성 검사
  const validation = validateForm(UserUpsertSchema, formPayload);
  if (!validation.isValid) return validation.errorResponse;

  try {
    // 🌟 3. 알맹이(Core) 호출
    // validation.data(깔끔한 객체)와 isProfileUpdate 플래그를 넘깁니다.
    const result = await saveUser(validation.data, isProfileUpdate);

    if (!result.success) {
      return {
        success: false,
        type: "error",
        message: result.message || "저장에 실패했습니다.",
        fieldErrors: result.fieldErrors
      };
    }

    // 웹 전용: 캐시 갱신
    if (paths) revalidatePath(paths);

    return {
      success: true,
      type: "success",
      message: "저장되었습니다.",
      data: result.data
    };

  } catch (error: any) {
    console.error("saveUserAction 에러:", error);
    return { success: false, type: "error", message: "데이터베이스 처리 중 오류가 발생했습니다." };
  }
};

// ==========================================
// [ACTION] 목록 조회 (getUserListAction -> getUserList 로 이름 변경)
// ==========================================
export async function getUserListAction(params: UserListParams): Promise<ActionState<UserListResponseData>> {
  try {
    // 🌟 알맹이 호출
    const data = await getUserList(params);

    return {
      success: true,
      message: "조회 성공",
      data: data // { userList, navigation }
    };
  } catch (error) {
    console.error("getUserListAction 에러:", error);
    return {
      success: false,
      type: "error",
      message: "목록을 불러오지 못했습니다."
    };
  }
}

// 💡 파라미터를 (id: number) 로 아주 직관적으로 바꿉니다!
export const removeUserAction = async (id: number): Promise<ActionState<any>> => {
  try {
    // 💡 이름을 getLoggedUserAction으로 변경
    const loggedInfo = await getLoggedUserAction();

    // 권한 체크 로직 (예시)
    if (!loggedInfo.isAdmin && loggedInfo.id !== id) {
      return { success: false, type: "error", message: "권한이 없습니다." };
    }

    // 🌟 1. 알맹이(Core) 호출 (user.ts에 있는 함수)
    const deletedUser = await removeUser(id);

    // 2. 웹 전용 로직 (본인 삭제 시 쿠키 파기)
    if (deletedUser.id === loggedInfo.id) {
      const cookieStore = await cookies();
      cookieStore.delete("refreshToken");
      cookieStore.delete("accessToken");
    }

    return { success: true, type: "success", message: "삭제 완료" };
  } catch (error: any) {
    console.error("removeUserAction 에러:", error);
    return { success: false, type: "error", message: error.message || "삭제 중 오류 발생" };
  }
};

export const updateUserStatusAdminAction = async (
  id: number,
  status: "active" | "pending" | "blocked",
): Promise<ActionState<{ id: number; status: string | null }>> => {
  const loggedInfo = await getLoggedUserAction();
  if (!loggedInfo.isAdmin) {
    return { success: false, type: "error", message: "관리자 권한이 필요합니다." };
  }

  try {
    const user = await query.updateUserStatus(id, status);
    revalidatePath("/admin/user/list");
    revalidatePath("/admin/user/pending");

    return {
      success: true,
      type: "success",
      message: status === "active" ? "회원이 승인되었습니다." : "회원 상태가 변경되었습니다.",
      data: { id: user.id, status: user.status },
    };
  } catch (error) {
    console.error("updateUserStatusAdminAction 에러:", error);
    return { success: false, type: "error", message: "회원 상태 변경 중 오류가 발생했습니다." };
  }
};

export type LoginLockInfo = {
  id: string;
  accountId: string;
  ip: string;
  lockedAt: string;
  expiresAt: string;
  retryAfter: number;
};

export const getLoginLockedUsersAdminAction = async (): Promise<ActionState<LoginLockInfo[]>> => {
  const loggedInfo = await getLoggedUserAction();
  if (!loggedInfo.isAdmin) {
    return { success: false, type: "error", message: "관리자 권한이 필요합니다." };
  }

  try {
    const metaKeys = await redisClient.keys("login_lock_meta:*");
    const rawRecords = metaKeys.length > 0 ? await redisClient.mget(...metaKeys) : [];
    const records = await Promise.all(rawRecords.map(async (raw, index) => {
      if (!raw) return null;

      try {
        const parsed = JSON.parse(raw) as LoginLockInfo & { lockKey?: string };
        const lockId = metaKeys[index].replace("login_lock_meta:", "");
        const retryAfter = await redisClient.ttl(parsed.lockKey || `login_lock:${lockId}`);

        if (retryAfter <= 0) {
          await redisClient.del(metaKeys[index]);
          return null;
        }

        return {
          id: lockId,
          accountId: parsed.accountId,
          ip: parsed.ip,
          lockedAt: parsed.lockedAt,
          expiresAt: parsed.expiresAt,
          retryAfter,
        };
      } catch {
        return null;
      }
    }));
    const knownIds = new Set(metaKeys.map((key) => key.replace("login_lock_meta:", "")));
    const lockKeys = await redisClient.keys("login_lock:*");
    const fallbackRecords = await Promise.all(lockKeys.map(async (lockKey) => {
      const lockId = lockKey.replace("login_lock:", "");
      if (knownIds.has(lockId)) return null;

      const retryAfter = await redisClient.ttl(lockKey);
      if (retryAfter <= 0) return null;
      const now = new Date();

      return {
        id: lockId,
        accountId: "정보 없음",
        ip: "-",
        lockedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + retryAfter * 1000).toISOString(),
        retryAfter,
      };
    }));

    return {
      success: true,
      type: "success",
      message: "로그인 잠금 목록을 불러왔습니다.",
      data: [...records, ...fallbackRecords].filter(Boolean) as LoginLockInfo[],
    };
  } catch (error) {
    console.error("getLoginLockedUsersAdminAction 에러:", error);
    return { success: false, type: "error", message: "로그인 잠금 목록을 불러오지 못했습니다." };
  }
};

export const unlockLoginUserAdminAction = async (lockId: string): Promise<ActionState<null>> => {
  const loggedInfo = await getLoggedUserAction();
  if (!loggedInfo.isAdmin) {
    return { success: false, type: "error", message: "관리자 권한이 필요합니다." };
  }

  try {
    await redisClient.del(`login_lock:${lockId}`, `login_lock_meta:${lockId}`);
    revalidatePath("/admin/user/login-locks");

    return { success: true, type: "success", message: "로그인 잠금을 해제했습니다." };
  } catch (error) {
    console.error("unlockLoginUserAdminAction 에러:", error);
    return { success: false, type: "error", message: "로그인 잠금 해제 중 오류가 발생했습니다." };
  }
};
/**
 * 🚀 [ACTION] 로그인된 유저 요약 정보 (쿠키 기반)
 */
export const getLoggedUserAction = async (): Promise<LoggedParams> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) return { id: 0, accountId: "", isAdmin: false };

  // 🌟 알맹이(Core)의 토큰 해석기 사용
  return await decodeUserToken(accessToken);
};

/**
 * 🚀 [ACTION] 로그인된 유저 상세 정보 (웹 세션용)
 */
export const getUserSessionAction = async (): Promise<ActionState<UserInfo>> => {
  // 1. 쿠키에서 요약 정보 가져오기
  const tokenInfo = await getLoggedUserAction();

  if (!tokenInfo.accountId) {
    return { success: false, type: "error", message: "토큰 정보가 올바르지 않습니다." };
  }

  try {
    // 🌟 2. 알맹이(Core)의 세션 조회 로직 사용
    const safeUserInfo = await getUserSession(tokenInfo.accountId);

    if (!safeUserInfo) {
      return { success: false, type: "error", message: "회원정보가 없습니다." };
    }

    return {
      success: true,
      message: "사용자 정보를 성공적으로 가져왔습니다.",
      data: safeUserInfo
    };
  } catch (e) {
    return { success: false, type: "error", message: "서버 오류 발생" };
  }
};

export const getUser = async (params: UserParams): Promise<ActionState<UserInfo>> => {
  const tokenInfo = await getLoggedUserAction();
  let obj: any = {};

  if (params.id) obj.id = params.id;
  if (params.uuid) obj.uuid = params.uuid.trim();

  if (!obj.id && !obj.uuid && !params.nickName && !params.accountId) {
    obj.accountId = tokenInfo.accountId;
  }

  if (Object.keys(obj).length === 0) {
    return { success: false, type: "error", message: "조회할 데이터가 없습니다." };
  }

  try {
    // 💡 query.findUserByCondition 호출!
    const userInfo = await query.findUserByCondition(obj);

    if (!userInfo) return { success: false, type: "error", message: "회원정보가 없습니다." };

    return { success: true, message: "조회 성공", data: excludeSensitiveData(userInfo) };
  } catch (e) {
    return { success: false, type: "error", message: "회원정보 조회 중 오류가 발생했습니다." };
  }
};

export const getUserFullById = async (id: number) => { // 💡 findUserFullById -> getUserFullById 로 변경
  if (!id) return null;

  try {
    // 💡 query.findUserFullById 호출!
    const user = await query.findUserFullById(id);
    if (!user) return null;

    return excludeSensitiveData(user);
  } catch (error) {
    return null;
  }
};

export async function updateProfileImageAction(profileImage: string | null): Promise<ActionState<{ profileImage: string | null }>> {
  try {
    const loggedInfo = await getLoggedUserAction();
    if (!loggedInfo?.id) {
      return { success: false, type: "error", message: "로그인이 필요합니다." };
    }

    const normalizedProfileImage = profileImage?.trim() || null;

    if (normalizedProfileImage) {
      const attachment = await query.findOwnedImageAttachmentByPath(loggedInfo.id, normalizedProfileImage);
      if (!attachment) {
        return { success: false, type: "error", message: "본인이 업로드한 이미지만 프로필 이미지로 사용할 수 있습니다." };
      }
    }

    await query.updateProfileImage(loggedInfo.id, normalizedProfileImage);
    revalidatePath("/user/userUpdate");

    return {
      success: true,
      type: "success",
      message: normalizedProfileImage ? "프로필 이미지가 변경되었습니다." : "프로필 이미지가 삭제되었습니다.",
      data: { profileImage: normalizedProfileImage },
    };
  } catch (error) {
    console.error("updateProfileImageAction 에러:", error);
    return { success: false, type: "error", message: "프로필 이미지 변경 중 오류가 발생했습니다." };
  }
}


// ==========================================
// [ACTION] 비밀번호 변경
// ==========================================
export async function changePassword(formData: FormData): Promise<ActionState<null>> {
  // 💡 1. 폼 데이터 추출 (클라이언트에서 넘어온 값)
  const formPayload = {
    nowPassword: formData.get("nowPassword") || formData.get("now_password") || "",
    newPassword: formData.get("newPassword") || formData.get("new_password") || "",
  };

  // 🛡️ [1차 방어선] Zod 형식 검사 (우리가 만든 모듈화 스키마 적용!)
  const validation = validateForm(PasswordChangeSchema, formPayload);

  // Zod 룰(8자 이상 등)을 통과 못하면 프론트엔드로 fieldErrors와 함께 즉시 빠꾸!
  if (!validation.isValid) return validation.errorResponse;

  // 검증을 통과한 안전하고 깔끔한 데이터
  const data = validation.data;

  try {
    const authSettings = await getAuthSettingsRuntimeAction();
    const passwordError = validatePasswordByAuthSettings(data.newPassword, authSettings);
    if (passwordError) {
      return {
        success: false,
        type: "error",
        message: passwordError,
        fieldErrors: { newPassword: passwordError },
      };
    }

    // 💡 2. 현재 로그인한 내 정보 가져오기
    const loggedInfo = await getLoggedUserAction();
    if (!loggedInfo || !loggedInfo.id) {
      return { success: false, type: "error", message: "로그인 정보가 없습니다. 다시 로그인해주세요." };
    }

    // 💡 3. DB에서 내 계정 정보(기존 암호화된 비밀번호) 가져오기
    const user = await query.findUserFullById(loggedInfo.id); // 기존에 만들어두신 함수 활용
    if (!user) {
      return { success: false, type: "error", message: "사용자를 찾을 수 없습니다." };
    }

    // 🛡️ [2차 방어선] 기존 비밀번호가 맞는지 검증!
    const isMatch = await verifyPassword(data.nowPassword, user.password);
    if (!isMatch) {
      // 🎯 핵심: 틀렸을 때 now_password 필드 밑에 빨간 글씨를 띄우도록 fieldErrors를 던져줍니다.
      return {
        success: false,
        type: "error",
        message: "현재 비밀번호가 일치하지 않습니다.",
        fieldErrors: { nowPassword: "현재 비밀번호가 일치하지 않습니다." }
      };
    }

    // 🌟 모든 방어선 통과! 새 비밀번호 암호화 후 DB 업데이트
    const newHashedPassword = await hashedPassword(data.newPassword);

    // (이 부분은 user.query.ts에 updatePassword 쿼리가 없다면 추가해야 합니다)
    await query.updatePassword(user.id, newHashedPassword);

    return { success: true, type: "success", message: "비밀번호가 성공적으로 변경되었습니다." };
  } catch (error: any) {
    console.error("changePassword Error:", error);
    return { success: false, type: "error", message: "비밀번호 변경 중 서버 오류가 발생했습니다." };
  }
}

export async function removeMyAccount(formData: FormData): Promise<ActionState<null>> {
  const formPayload = {
    password: formData.get("password") || "",
  };

  // 🛡️ [1차 방어선] Zod 검사 (값이 비어있는지만 체크)
  const validation = validateForm(PasswordVerifySchema, formPayload);
  if (!validation.isValid) return validation.errorResponse;

  const data = validation.data;

  try {
    const authSettings = await getAuthSettingsRuntimeAction();
    if (!authSettings.accountDeletionEnabled) {
      return { success: false, type: "error", message: "현재 회원 탈퇴가 허용되어 있지 않습니다." };
    }

    const loggedInfo = await getLoggedUserAction();
    if (!loggedInfo || !loggedInfo.id) {
      return { success: false, type: "error", message: "로그인 정보가 없습니다." };
    }

    // DB에서 내 계정 정보 가져오기
    const user = await query.findUserFullById(loggedInfo.id);
    if (!user) {
      return { success: false, type: "error", message: "사용자를 찾을 수 없습니다." };
    }

    // 🛡️ [2차 방어선] 비밀번호 일치 여부 확인!
    const isMatch = await verifyPassword(data.password, user.password);
    if (!isMatch) {
      // 🎯 비밀번호가 틀리면 인풋창으로 포커스를 보내기 위해 fieldErrors를 쏴줍니다!
      return {
        success: false,
        type: "error",
        message: "비밀번호가 일치하지 않습니다.",
        fieldErrors: { password: "비밀번호가 일치하지 않습니다." }
      };
    }

    // 🌟 모든 검증 통과! DB에서 삭제 처리 (기존에 만들어두신 query.deleteUser 재활용!)
    await query.deleteUser(user.id);

    // 🌟 안전하게 로그아웃 (쿠키 파기)
    const cookieStore = await cookies();
    cookieStore.delete("refreshToken");
    cookieStore.delete("accessToken");

    return { success: true, type: "success", message: "회원 탈퇴가 완료되었습니다." };
  } catch (error: any) {
    console.error("deleteMyAccount Error:", error);
    return { success: false, type: "error", message: "탈퇴 처리 중 서버 오류가 발생했습니다." };
  }
}

export async function verifyMyPassword(password: string): Promise<ActionState<null>> {
  // 💡 1. 빈 값일 때도 fieldErrors를 던져주도록 수정했습니다!
  if (!password) {
    return {
      success: false,
      type: "error",
      message: "비밀번호를 입력해주세요.",
      fieldErrors: { password: "비밀번호를 입력해주세요." } // 🎯 프론트 포커스용!
    };
  }

  try {
    const loggedInfo = await getLoggedUserAction();
    if (!loggedInfo || !loggedInfo.id) {
      return { success: false, type: "error", message: "로그인 정보가 없습니다." };
    }

    const user = await query.findUserFullById(loggedInfo.id);
    if (!user) return { success: false, type: "error", message: "사용자를 찾을 수 없습니다." };

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return {
        success: false,
        type: "error",
        message: "비밀번호가 일치하지 않습니다.",
        fieldErrors: { password: "비밀번호가 일치하지 않습니다." } // 🎯 텍스트 통일
      };
    }

    return { success: true, type: "success", message: "비밀번호가 확인되었습니다. 탈퇴를 진행하실 수 있습니다." };
  } catch (error: any) {
    return { success: false, type: "error", message: "서버 오류가 발생했습니다." };
  }
}
