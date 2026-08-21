// src/app/(extentions)/user/_actions/group.query.ts
import prisma from "@utils/db/prisma";

// 1. 유저-그룹 매핑 초기화 및 재생성 (트랜잭션/createMany 최적화)
export const updateUserGroupQuery = async (userId: number, groupIds: number[]) => {
  return await prisma.$transaction(async (tx) => {
    // 기존 그룹 매핑 삭제
    await tx.userGroupUser.deleteMany({
      where: { userId: userId },
    });

    // 새로운 그룹 매핑 다중 생성 (for문 대신 createMany로 성능 최적화)
    if (groupIds && groupIds.length > 0) {
      const groupData = groupIds.map(id => ({ userId, groupId: Number(id) }));
      await tx.userGroupUser.createMany({
        data: groupData,
      });
    }
  });
};

// 2. 유저-그룹 매핑 전체 삭제
export const deleteUserGroupQuery = async (userId: number) => {
  return await prisma.userGroupUser.deleteMany({
    where: { userId: userId },
  });
};

// 3. 전체 그룹 목록 조회
export const getAllGroupsQuery = async () => {
  return await prisma.userGroup.findMany({
    orderBy: { groupName: "asc" },
  });
};

// 4. 그룹 생성 또는 수정 (upsert 로직 개선)
export const upsertGroupQuery = async (
  groupId: number | null,
  data: { groupName: string; groupTitle: string; groupDesc: string }
) => {
  if (groupId) {
    // ID가 있으면 수정 (UPDATE)
    return await prisma.userGroup.update({
      where: { id: groupId },
      data,
    });
  } else {
    // ID가 없으면 생성 (CREATE)
    return await prisma.userGroup.create({
      data,
    });
  }
};

// 5. 그룹 삭제
export const deleteGroupQuery = async (groupId: number) => {
  return await prisma.userGroup.delete({
    where: { id: groupId },
  });
};

export const checkExistingGroupName = async (groupName: string) => {
  return await prisma.userGroup.findUnique({
    where: { groupName: groupName },
  });
};