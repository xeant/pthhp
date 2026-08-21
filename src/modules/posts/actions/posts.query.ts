// src/app/(extentions)/posts/_actions/posts.query.ts
import prisma from "@utils/db/prisma";
import { Prisma } from "@core/utils/db/generated/client";
import { PostsParams, ExtraFieldConfig } from "./_type"; // 경로에 맞게 호출

// ==========================================
// [Document] 실제 게시글 관련 쿼리
// ==========================================

export async function findModuleByMid(mid: string) {
  return prisma.modules.findUnique({
    where: { mid },
    // 🌟 이 부분이 없으면 FieldGroup 데이터를 가져오지 않습니다!
    include: {
      FieldGroup: true,
    },
  });
}

export async function findPostsList(
  page: number = 1,
  pageSize: number = 10,
  keyword?: string,
  target: "mid" | "moduleName" = "moduleName",
) {
  const whereCondition: Prisma.ModulesWhereInput = keyword
    ? { [target]: { contains: keyword } }
    : {};

  const [items, totalCount] = await Promise.all([
    prisma.modules.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.modules.count({ where: whereCondition }),
  ]);

  return { items, totalCount };
}

export async function insertPosts(data: PostsParams) {
  return prisma.modules.create({ data });
}

export async function updatePosts(id: number, data: PostsParams) {
  return prisma.modules.update({ where: { id }, data });
}

// ==========================================
// [Category & Permission] 부가 정보 쿼리
// ==========================================

export async function findCategoriesByModuleId(moduleId: number) {
  return prisma.category.findMany({
    where: { moduleType: "posts", moduleId, parentId: null },
    include: { children: true },
    orderBy: { order: "asc" },
  });
}

export async function findPermissionsByModuleId(moduleId: number) {
  return prisma.permission.findMany({
    where: { moduleType: "posts", moduleId },
  });
}

export async function deletePermissions(moduleId: number) {
  return prisma.permission.deleteMany({
    where: { moduleType: "posts", moduleId },
  });
}

export async function insertPermissions(data: Prisma.PermissionCreateManyInput[]) {
  if (data.length === 0) return;
  return prisma.permission.createMany({ data });
}

export async function findPostsById(id: number) {
  return prisma.modules.findUnique({
    where: { id },
    include: {
      FieldGroup: true,
    }
  });
}

export async function findModuleById(id: number) {
  return prisma.modules.findUnique({
    where: { id },
    // 🌟 이 부분을 추가해야 설계도(FieldGroup)를 함께 가져옵니다.
    include: {
      FieldGroup: true,
    },
  });
}

export async function findPostsByPid(mid: string) {
  return prisma.modules.findUnique({
    where: { mid },
    include: {
      FieldGroup: true,
    }
  });
}

export async function deletePosts(ids: number[]) {
  return prisma.$transaction(async (tx) => {
    // 1. 선택된 게시판들의 권한 데이터 일괄 삭제
    await tx.permission.deleteMany({
      where: {
        moduleType: "posts",
        moduleId: { in: ids },
      },
    });

    // 2. 게시판 데이터 일괄 삭제
    const result = await tx.modules.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return result;
  });
}

export async function updateModuleFieldSchema(mid: string, extraFields: any[]) {
  // 1. 우선 모듈이 있는지 확인합니다.
  const foundModule = await prisma.modules.findUnique({
    where: { mid },
    select: { id: true, fieldGroupId: true }
  });

  if (!foundModule) {
    throw new Error("해당 모듈을 찾을 수 없습니다.");
  }

  // 🌟 [핵심] 트랜잭션으로 안전하게 생성 혹은 업데이트 진행
  return prisma.$transaction(async (tx) => {

    // 2. 만약 연결된 필드 그룹(fieldGroupId)이 없다면? (현재 희정님의 DB 초기화 상황)
    if (!foundModule.fieldGroupId) {
      // 신규 필드 그룹 생성
      const newGroup = await tx.fieldGroup.create({
        data: {
          name: `${mid}_extra_fields_${Date.now()}`, // 고유 이름 부여
          fields: extraFields,
        }
      });

      // 3. 생성된 그룹 ID를 현재 모듈에 연결 (이게 빠지면 다음에 또 에러 납니다)
      await tx.modules.update({
        where: { mid },
        data: { fieldGroupId: newGroup.id }
      });

      console.log(`[Success] New FieldGroup created for module: ${mid}`);
      return newGroup;
    }

    // 4. 이미 연결된 필드 그룹이 있다면? (기존에 쓰던 상황)
    // 128번 줄의 에러 대신, 그냥 바로 업데이트를 때려버립니다.
    return tx.fieldGroup.update({
      where: { id: foundModule.fieldGroupId },
      data: { fields: extraFields }
    });
  });
}
