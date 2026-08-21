// src/app/(extentions)/user/_actions/group.action.ts
"use server";

import { getUserSessionAction } from "@/modules/user/actions/user.action"; // 파일 경로에 맞게 수정
import * as query from "./group.query";
import { validateForm } from "@utils/validation/formValidator";
import { ActionState, GroupInfo, GroupUpsertSchema } from "./_type";

export const getGroups = async () => {
  return getAllGroupRecords(); // 그룹 리스트를 이름순으로 반환
};

// ==========================================
// [유저 그룹 매핑 관련]
// ==========================================
export const updateUserGroup = async (userId: number, groupId: number[]) => {
  if (!userId) {
    return { success: false, type: "error", message: '사용자 정보가 없습니다.', data: {} };
  }

  try {
    await query.updateUserGroupQuery(userId, groupId);
    return { success: true, type: "success", message: "적용되었습니다." };
  } catch (error) {
    console.error("updateUserGroup Error:", error);
    return { success: false, type: "error", message: '그룹 적용 중 오류가 발생했습니다.' };
  }
};

export const deleteUserGroup = async (userId: number) => {
  if (!userId) {
    return { success: false, type: "error", message: '사용자 정보가 없습니다.', data: {} };
  }

  try {
    await query.deleteUserGroupQuery(userId);
    return { success: true, type: "success" };
  } catch (error) {
    console.error("deleteUserGroup Error:", error);
    return { success: false, type: "error", message: '그룹 삭제 중 오류가 발생했습니다.' };
  }
};

// ==========================================
// [그룹 자체 관리 관련]
// ==========================================

// 페이지 렌더링용 (서버 컴포넌트에서 직접 호출)
export async function getAllGroupRecords() {
  return await query.getAllGroupsQuery();
}


// ==========================================
// [ACTION] 그룹 추가/수정 (Zod 파싱 + ActionState 적용)
// ==========================================
export const upsertGroup = async (formData: FormData): Promise<ActionState<GroupInfo>> => {
  const sessionInfo = await getUserSessionAction();

  // 1. 관리자 권한 체크
  if (!sessionInfo?.data?.isAdmin) {
    return { success: false, type: "error", message: '권한이 없습니다.' };
  }

  // 2. 폼 데이터 추출 (Zod가 알아서 타입 변환해 줄 거라 그냥 get으로 꺼냅니다)
  const formPayload = {
    groupId: formData.get("groupId"),
    groupName: formData.get("groupName"),
    groupTitle: formData.get("groupTitle"),
    groupDesc: formData.get("groupDesc"),
  };

  // 🛡️ 3. Zod로 1차 입구 컷 (에러 시 fieldErrors 예쁘게 포장해서 반환)
  const validation = validateForm(GroupUpsertSchema, formPayload);
  if (!validation.isValid) return validation.errorResponse;

  const data = validation.data; // 완벽하게 타입 추론된 깨끗한 데이터

  try {
    // 🛡️ 4. 신규 생성 시에만 groupName(그룹ID) 중복 검사
    if (!data.groupId) {
      // 💡 주의: 이 함수는 group.query.ts에 만들어주셔야 합니다! (아래 참고)
      const existing = await query.checkExistingGroupName(data.groupName);
      if (existing) {
        return {
          success: false,
          type: "error",
          message: "이미 사용 중인 그룹ID 입니다.",
          fieldErrors: { groupName: "이미 사용 중인 그룹ID 입니다." }
        };
      }
    }

    // 5. DB 저장
    const userGroup = await query.upsertGroupQuery(data.groupId || null, {
      groupName: data.groupName,
      groupTitle: data.groupTitle,
      groupDesc: data.groupDesc || ""
    });

    return {
      success: true,
      type: "success",
      message: data.groupId ? '그룹이 성공적으로 수정되었습니다.' : '그룹이 성공적으로 등록되었습니다.',
      data: userGroup
    };
  } catch (error) {
    console.error("upsertGroup Error:", error);
    return { success: false, type: "error", message: '그룹 저장에 실패하였습니다.' };
  }
};


// 그룹 삭제 (Action)
export const deleteGroup = async (groupId: number) => {
  const sessionInfo = await getUserSessionAction();

  if (!sessionInfo?.data?.isAdmin) {
    return { success: false, type: "error", message: '권한이 없습니다.', data: {} };
  }

  try {
    const userGroup = await query.deleteGroupQuery(groupId);
    return {
      success: true,
      type: "success",
      message: '그룹이 성공적으로 삭제되었습니다.',
      data: userGroup
    };
  } catch (error) {
    console.error("deleteGroup Error:", error);
    return { success: false, type: "error", message: '그룹 삭제에 실패하였습니다.', data: {} };
  }
};
