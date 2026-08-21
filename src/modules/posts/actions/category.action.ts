// src/app/(extentions)/posts/_actions/category.action.ts
"use server";

import { revalidatePath } from "next/cache";
import * as query from "./category.query";
import * as category from "./category";
import { ActionState, TreeItem } from "./_type";

export async function getCategoriesAdminAction(
  moduleId: number,
  moduleType: string = "posts",
): Promise<ActionState<TreeItem[]>> {
  const numericModuleId = Number(moduleId);

  if (isNaN(numericModuleId)) {
    return { success: true, message: "유효하지 않은 모듈 ID입니다.", data: [] };
  }

  try {
    const tree = await category.getCategories(numericModuleId, moduleType);

    return {
      success: true,
      message: tree.length > 0 ? "조회 성공" : "등록된 카테고리가 없습니다.",
      data: tree,
    };
  } catch (error) {
    console.error("카테고리 로드 에러:", error);
    return {
      success: false,
      message: "DB 조회 중 오류가 발생했습니다.",
      data: [],
    };
  }
}

export async function addCategoryAdminAction(
  title: string,
  parentId: string | null = null,
  moduleId: number,
  moduleType: string = "posts",
): Promise<ActionState<any>> {
  try {
    const result = await category.addCategory({
      title,
      parentId,
      moduleId,
      moduleType,
    });

    return {
      success: true,
      message: "카테고리가 추가되었습니다.",
      data: result,
    };
  } catch (error: any) {
    // 외래키 에러(P2003)일 경우 사용자에게 더 친절하게 안내
    console.log(error);
    if (error.code === "P2003") {
      return {
        success: false,
        message: "지정한 부모 카테고리를 찾을 수 없습니다.",
      };
    }

    console.error("❌ addCategoryAction Error:", error);
    return { success: false, message: "카테고리 추가 실패" };
  }
}

export async function renameCategoryAdminAction(
  id: string,
  title: string,
): Promise<ActionState<any>> {
  try {
    const result = await category.renameCategory(parseInt(id), title);
    return { success: true, message: "이름이 변경되었습니다.", data: result };
  } catch (error) {
    return { success: false, message: "이름 변경 실패" };
  }
}

export async function removeCategoryAdminAction(
  id: string,
  path?: string,
): Promise<ActionState<null>> {
  try {
    await category.removeCategory(parseInt(id));
    if (path) revalidatePath(path);
    return { success: true, message: "카테고리가 삭제되었습니다." };
  } catch (error) {
    return { success: false, message: "카테고리 삭제 실패" };
  }
}

export async function saveCategoryTreeAdminAction(
  items: TreeItem[],
  moduleType: string = "posts",
  path?: string,
): Promise<ActionState<null>> {
  try {
    await category.saveCategoryTree(items, moduleType);
    if (path) revalidatePath(path);
    return { success: true, message: "카테고리 구조가 저장되었습니다." };
  } catch (error) {
    console.error("saveCategoryTreeAction Error:", error);
    return { success: false, message: "트리 저장 중 오류가 발생했습니다." };
  }
}
