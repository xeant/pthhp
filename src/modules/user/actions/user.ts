// src/app/(extentions)/users/_actions/user.ts
import { hashedPassword } from "@utils/auth/password";
import { verify } from "@utils/auth/jwtAuth";
import * as query from "./user.query";
import { dispatchTrigger } from "@utils/trigger/triggerHub";
import { UserListParams, UserListSchema, UserInfo, LoggedParams } from "./_type";
import { getAuthSettingsRuntimeAction, validatePasswordByAuthSettings } from "@/modules/admin/actions/auth-settings";

/**
 * 🌟 타 모듈에서도 안심하고 쓸 수 있는 함수
 * 쿠키를 뒤지지 않고, 인자로 받은 ID로만 작동합니다.
 */
export const getUserById = async (id: number) => {
  const user = await query.findUserFullById(id);
  if (!user) return null;
  return excludeSensitiveData(user);
};

/**
 * 🌟 [CORE] 토큰 해석기
 * 토큰 문자열을 주면 유저 정보를 해독합니다. (웹/앱 공통)
 */
export const decodeUserToken = async (token: string): Promise<LoggedParams> => {
  try {
    const verifiedToken = await verify(token);
    if (!verifiedToken) return { id: 0, accountId: "", isAdmin: false };

    return {
      id: verifiedToken.id,
      accountId: verifiedToken.accountId,
      isAdmin: Boolean(verifiedToken.isAdmin),
    };
  } catch (e) {
    return { id: 0, accountId: "", isAdmin: false };
  }
};

/**
 * 🌟 [CORE] 유저 세션 정보 조회
 * accountId를 주면 DB에서 민감정보가 제거된 유저 데이터를 가져옵니다.
 */
export const getUserSession = async (accountId: string): Promise<UserInfo | null> => {
  const userInfo = await query.findUserSessionData(accountId);
  if (!userInfo) return null;

  return excludeSensitiveData(userInfo);
};

/**
 * 🌟 [CORE] 유저 목록 조회
 * 웹과 앱에서 공통으로 사용할 "안전한" 유저 목록 반환 로직입니다.
 */
export const getUserList = async (params: UserListParams) => {
  // 1. 파라미터 검증 및 기본값 설정
  const validatedParams = UserListSchema.parse(params);
  validatedParams.listCount = 20;

  // 2. DB 조회 (이미 분리된 query 호출)
  const result = await query.findUserList(validatedParams);

  // 3. 🌟 데이터 가공 (민감 정보 제거)
  // 이 로직을 여기 둬야 나중에 앱에서도 비밀번호가 안 나갑니다!
  const safeUserList = result.userList.map(excludeSensitiveData);

  return {
    userList: safeUserList,
    navigation: result.navigation
  };
};

/**
 * 🌟 [CORE] 유저 저장 (등록/수정)
 * 모든 비즈니스 로직(중복검사, 암호화, DB저장, 트리거)이 여기 모여있습니다.
 */
export const saveUser = async (data: any, isProfileUpdate: boolean) => {
  // 1. DB 중복 검사
  const duplicates = await query.findUser(data.accountId, data.email_address, data.nickName, data.id);

  if (duplicates.length > 0) {
    const fieldErrors: Record<string, string> = {};
    duplicates.forEach(dup => {
      if (dup.accountId === data.accountId) fieldErrors.accountId = "이미 사용 중인 아이디입니다.";
      if (dup.email_address === data.email_address) fieldErrors.email_address = "이미 사용 중인 이메일입니다.";
      if (dup.nickName === data.nickName) fieldErrors.nickName = "이미 사용 중인 닉네임입니다.";
    });

    return {
      success: false,
      message: Object.values(fieldErrors)[0] || "중복된 정보가 있습니다.",
      fieldErrors
    };
  }

  let resultUser: any;

  // 2. 등록 / 수정 분기 로직
  if (!data.id) {
    // --- [CREATE] ---
    if (!data.password) {
      return { success: false, message: "비밀번호는 필수입니다.", fieldErrors: { password: "비밀번호는 필수입니다." } };
    }

    const authSettings = await getAuthSettingsRuntimeAction();
    const passwordError = validatePasswordByAuthSettings(data.password, authSettings);
    if (passwordError) {
      return { success: false, message: passwordError, fieldErrors: { password: passwordError } };
    }

    const pw = await hashedPassword(data.password);
    const insertData = {
      accountId: data.accountId,
      password: pw,
      email_address: data.email_address,
      nickName: data.nickName,
      isAdmin: data.isAdmin,
      status: data.status || authSettings.defaultUserStatus,
    };

    const created = await query.upsertUser(false, null, insertData, data.group?.map((g: any) => Number(g.groupId)) || []);
    resultUser = { ...created, _isNew: true };
  } else {
    // --- [UPDATE] ---
    const updateData: any = {
      nickName: data.nickName,
      email_address: data.email_address,
      isAdmin: data.isAdmin,
      accountId: data.accountId
    };

    if (data.status) {
      updateData.status = data.status;
    }

    if (data.password?.trim()) {
      const authSettings = await getAuthSettingsRuntimeAction();
      const passwordError = validatePasswordByAuthSettings(data.password, authSettings);
      if (passwordError) {
        return { success: false, message: passwordError, fieldErrors: { password: passwordError } };
      }

      updateData.password = await hashedPassword(data.password);
    }

    // 🌟 프로필 업데이트 여부에 따른 그룹 처리 로직 유지
    const groupsToUpdate = isProfileUpdate || data.group === undefined
      ? undefined
      : data.group.map((g: any) => Number(g.groupId));

    const updated = await query.upsertUser(true, data.id, updateData, groupsToUpdate);
    resultUser = { ...updated, _isNew: false };
  }

  // 3. 🎯 트리거 수동 발송 (웹/앱 공통)
  await dispatchTrigger("user.saved", { result: resultUser });

  return { success: true, data: resultUser };
};

/**
 * 🌟 [CORE] 유저 삭제
 */
export const removeUser = async (userId: number) => {
  const user = await query.findUserFullById(userId);
  if (!user) throw new Error("삭제할 유저를 찾을 수 없습니다.");

  await query.deleteUser(userId);

  // 🎯 트리거 수동 발송
  await dispatchTrigger("user.removed", user);

  return user;
};

/**
 * 💡 공통 유틸: Prisma 결과물에서 민감한 정보(비밀번호 등) 제외하기
 */
function excludeSensitiveData(user: any): UserInfo {
  const { password, refreshToken, ...safeUser } = user;
  return safeUser as UserInfo;
}
