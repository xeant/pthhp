// src/app/(extentions)/posts/_actions/category.query.ts
import prisma from "@utils/db/prisma";
import { TreeItem, CategoryParams } from "./_type";
import { nanoid } from "nanoid";

export async function findCategoriesByModuleId(
  moduleType: string,
  moduleId: number
): Promise<TreeItem[]> {
  const categories = await prisma.category.findMany({
    where: {
      moduleType,
      moduleId
    },
    orderBy: { order: "asc" },
  });

  return categories.map((c) => ({
    id: c.id.toString(),
    title: c.title,
    slug: c.slug,
    parentId: c.parentId?.toString() ?? null,
    order: c.order,
    moduleType: c.moduleType,

    // 🌟 해결 1: Prisma 상에서 moduleId는 null일 수 있으므로,
    // 인자로 받은 moduleId를 직접 넣거나 0으로 폴백 처리를 해줍니다.
    moduleId: c.moduleId ?? moduleId,

    // 🌟 해결 2: []만 쓰면 TypeScript가 never[]로 오해합니다.
    // 명시적으로 TreeItem[] 임을 알려주세요.
    children: [] as TreeItem[],
  }));
}

export async function insertCategory(data: CategoryParams) {
  return prisma.category.create({
    data: {
      title: data.title,
      slug: data.slug || nanoid(10),
      parentId: data.parentId ? Number(data.parentId) : null,
      moduleId: Number(data.moduleId),
      moduleType: data.moduleType,
      order: 0, // 초기 순서값
    },
  });
}

// export async function insertCategory(data: { title: string; parentId: number | null; moduleType: string }) {
//   return await prisma.category.create({ data });
// }

export async function updateCategoryTitle(id: number, title: string) {
  return prisma.category.update({
    where: { id },
    data: { title },
  });
}

/**
 * 재귀적 삭제 (Prisma 레벨에서 자식까지 삭제)
 */
export async function deleteCategoryRecursive(id: number): Promise<void> {
  const children = await prisma.category.findMany({
    where: { parentId: id },
  });

  for (const child of children) {
    await deleteCategoryRecursive(child.id);
  }

  await prisma.category.delete({
    where: { id },
  });
}

/**
 * 전체 트리 동기화 (트랜잭션)
 */
export async function syncCategoryTree(items: TreeItem[], moduleType: string) {
  return prisma.$transaction(async (tx) => {
    // 1. 기존 리소스 관련 카테고리 일괄 삭제
    await tx.category.deleteMany({ where: { moduleType } });

    // 2. 1단계: 부모 없이 모두 생성 (ID 충돌 방지 및 생성 우선)
    for (const item of items) {
      await tx.category.create({
        data: {
          id: parseInt(item.id),
          slug: item.slug || nanoid(10),
          title: item.title,
          parentId: null,
          order: item.order,
          moduleId: item.moduleId,
          moduleType: item.moduleType || moduleType,
        },
      });
    }

    // 3. 2단계: 실제 부모 관계 업데이트
    for (const item of items) {
      if (item.parentId) {
        await tx.category.update({
          where: { id: parseInt(item.id) },
          data: { parentId: parseInt(item.parentId) },
        });
      }
    }
  }, { timeout: 10000 });
}