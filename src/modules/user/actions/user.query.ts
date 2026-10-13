// src/app/(extentions)/users/_actions/user.query.ts
import { Prisma } from "@core/utils/db/generated/client";
import prisma from "@utils/db/prisma";
import { UserListParsedParams } from "./_type";
import { nanoid } from "nanoid";

// ==========================================
// [READ] 단순 사용자 조회 (무조건 find 접두사 사용)
// ==========================================
export function findUserById(userId: number) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
}

export function findUserByUUID(uuid: string) {
  return prisma.user.findUnique({ where: { uuid } });
}

export function findUserByAccountOrEmail(accountIdOrEmail: string) {
  return prisma.user.findFirst({
    where: {
      OR: [{ accountId: accountIdOrEmail }, { email_address: accountIdOrEmail }],
    },
  });
}

export function findUserByAccountId(accountId: string) {
  return prisma.user.findUnique({ where: { accountId } });
}

export function findUserByNickname(nickName: string) {
  return prisma.user.findUnique({ where: { nickName } });
}

// ==========================================
// [READ] 관계 포함 복잡한 조회 (무조건 find 접두사 사용)
// ==========================================
export function findUserFullById(userId: number) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      userGroups: { include: { group: true } },
    },
  });
}

export function findUserSessionData(accountId: string) { // 💡 getUserSessionData -> find 로 변경
  return prisma.user.findUnique({
    where: { accountId },
    include: {
      profile: true,
      userGroups: {
        include: {
          group: { include: { users: { include: { user: true } } } },
        },
      },
    },
  });
}

export function findUserByCondition(whereObj: Prisma.UserWhereUniqueInput) { // 💡 getUserDataByObj -> find 로 변경
  return prisma.user.findUnique({
    where: whereObj,
    include: {
      userGroups: { include: { group: true } },
    },
  });
}

export async function findUserList(params: UserListParsedParams) { // 💡 getUserList -> find 로 변경
  const { page, target, keyword, listCount, status } = params;
  const skipAmount = (page - 1) * listCount;
  const where: any = {};

  if (target && keyword) {
    where[target] = { contains: keyword };
  }

  if (status) {
    where.status = status;
  }

  const [totalItems, userList] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      skip: skipAmount,
      take: listCount,
      where,
      orderBy: { id: "desc" },
    }),
  ]);

  return {
    userList,
    navigation: {
      totalCount: totalItems,
      totalPages: Math.ceil(totalItems / listCount),
      page,
      listCount,
    },
  };
}

// ==========================================
// [WRITE & CHECK] 트랜잭션 및 유효성 검사 쿼리
// ==========================================
export function checkExistingUser(accountId: string, nickName: string) {
  return prisma.user.findFirst({
    where: { OR: [{ accountId }, { nickName }] },
  });
}

export async function findUser(accountId: string, email: string, nickName: string, excludeId?: number) {
  return prisma.user.findMany({
    where: {
      OR: [
        { accountId: accountId },
        { email_address: email },
        { nickName: nickName },
      ],
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}


export async function upsertUser(
  isUpdate: boolean,
  targetId: number | null,
  data: Prisma.UserCreateInput | Prisma.UserUpdateInput,
  groups?: number[]
) {
  return prisma.$transaction(async (tx) => {
    let finalId = targetId;
    let userRecord;

    if (!isUpdate) {
      // [생성]
      // 🌟 핵심: data에 slug가 없으면 여기서 nanoid를 강제로 주입합니다.
      const createData = {
        ...(data as Prisma.UserCreateInput),
        slug: (data as Prisma.UserCreateInput).slug || nanoid(10),
      };

      userRecord = await tx.user.create({ data: createData });
      finalId = userRecord.id;
    } else {
      // [수정]
      userRecord = await tx.user.update({
        where: { id: finalId! },
        data: data as Prisma.UserUpdateInput
      });
    }

    // groups 처리 로직 (기존과 동일 - 아주 좋습니다!)
    if (groups !== undefined) {
      await tx.userGroupUser.deleteMany({ where: { userId: finalId! } });
      if (groups.length > 0) {
        await tx.userGroupUser.createMany({
          data: groups.map((groupId) => ({ groupId, userId: finalId! })),
        });
      }
    }

    return userRecord;
  });
}

export async function updateUserStatus(userId: number, status: "active" | "pending" | "blocked") {
  return prisma.user.update({
    where: { id: userId },
    data: { status },
  });
}

export async function deleteUser(userId: number) {
  return prisma.$transaction(async (tx) => {
    // 1. 그룹 매핑 삭제
    await tx.userGroupUser.deleteMany({ where: { userId } });

    // 2. 유저 삭제 후 결과 담기
    const deletedUser = await tx.user.delete({ where: { id: userId } });

    // 🌟 3. 삭제된 유저 정보를 리턴!
    return deletedUser;
  });
}

export async function updatePassword(userId: number, newPasswordHash: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { password: newPasswordHash },
  });
}

export async function findOwnedImageAttachmentByPath(userId: number, path: string) {
  return prisma.attachment.findFirst({
    where: {
      userId,
      path,
      mimeType: {
        startsWith: "image/",
      },
    },
    select: {
      id: true,
      path: true,
    },
  });
}

export async function updateProfileImage(userId: number, profileImage: string | null) {
  const existingProfile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (existingProfile) {
    return prisma.profile.update({
      where: { userId },
      data: { profileImage },
    });
  }

  return prisma.profile.create({
    data: {
      userId,
      phone: `profile-${userId}`,
      profileImage,
    },
  });
}
