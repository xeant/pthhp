"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import * as query from "./posts.query";
import * as posts from "./posts";
import { getAuthenticatedUser } from "@utils/auth/authHelper";

import {
  ActionState,
  PostsUpsertSchema,
  DocumentInfo,
  ExtraFieldConfig,
} from "./_type";
import { validateForm } from "@utils/validation/formValidator";

// ==========================================
// [ACTION - Modules] 모듈 설정(설계도/권한 포함) 조회
// ==========================================
export async function getModuleInfoAction(
  mid: string,
): Promise<ActionState<any>> {
  try {
    const postInfo = await posts.getPostFullInfo(mid);

    if (!postInfo) {
      return {
        success: false,
        type: "error",
        message: "모듈을 찾을 수 없습니다.",
      };
    }

    return {
      success: true,
      message: "조회 성공",
      data: postInfo,
    };
  } catch (error) {
    console.error("getModuleInfo Error:", error);
    return {
      success: false,
      type: "error",
      message: "모듈 정보를 불러오지 못했습니다.",
    };
  }
}

// ==========================================
// [ACTION - Posts] 게시판 자체(모듈) 설정 저장 (권한 동시 처리)
// ==========================================
export async function savePostsAdminAction(
  formData: FormData,
  paths?: string,
): Promise<ActionState<number>> {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.isAdmin)
      return {
        success: false,
        type: "error",
        message: "관리자 권한이 필요합니다.",
      };

    const formPayload = {
      id: formData.get("id"),
      mid: formData.get("mid"),
      moduleName: formData.get("moduleName"),
      moduleDesc: formData.get("moduleDesc"),
      config: JSON.parse((formData.get("config") as string) || "{}"),
      permissions: JSON.parse((formData.get("permissions") as string) || "{}"),
    };

    console.log(formPayload);

    const validation = validateForm(PostsUpsertSchema, formPayload);
    if (!validation.isValid) {
      return validation.errorResponse;
    }
    const data = validation.data;

    let postId: number;
    if (data.id) {
      const updated = await query.updatePosts(data.id, {
        mid: data.mid,
        moduleName: data.moduleName,
        moduleDesc: data.moduleDesc,
        config: data.config,
      });
      postId = updated.id;
    } else {
      const created = await query.insertPosts({
        mid: data.mid,
        moduleName: data.moduleName,
        moduleDesc: data.moduleDesc,
        config: data.config,
      });
      postId = created.id;
    }

    if (formPayload.permissions) {
      await query.deletePermissions(postId);
      const newPermissions = Object.entries(formPayload.permissions).flatMap(
        ([type, list]: [string, any]) =>
          list.map((p: any) => ({
            moduleType: "posts",
            moduleId: postId,
            action: type.replace("Permissions", "").toLowerCase(),
            subjectType: p.subjectType,
            subjectId: p.subjectId ?? null,
          })),
      );
      await query.insertPermissions(newPermissions);
    }

    if (paths) {
      revalidatePath(paths);
    }
    return {
      success: true,
      type: "success",
      message: "게시판 설정이 저장되었습니다.",
      data: postId,
    };
  } catch (error) {
    return {
      success: false,
      type: "error",
      message: "게시판 저장 중 오류가 발생했습니다.",
    };
  }
}

export async function getPostsListAdminAction(
  page: number = 1,
  pageSize: number = 10,
  keyword?: string,
  target: "mid" | "moduleName" = "moduleName",
): Promise<ActionState<any>> {
  try {
    const { items, totalCount } = await posts.getPostsList(
      page,
      pageSize,
      keyword,
      target,
    );

    const pagination = {
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      page,
      listCount: items.length,
    };

    return {
      success: true,
      type: "success",
      message: "게시판 목록 조회 성공",
      data: {
        items,
        pagination,
      },
    };
  } catch (error) {
    console.error("getPostsList 에러:", error);
    return {
      success: false,
      type: "error",
      message: "게시판 목록을 불러오는 중 오류가 발생했습니다.",
    };
  }
}

export async function getPostsInfoAction(
  mid: string,
): Promise<ActionState<any>> {
  try {
    const postInfo = await posts.getPostFullInfo(mid);
    if (!postInfo)
      return {
        success: false,
        type: "error",
        message: "게시판을 찾을 수 없습니다.",
      };

    return {
      success: true,
      message: "조회 성공",
      data: postInfo,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      type: "error",
      message: "정보를 불러오지 못했습니다.",
    };
  }
}

export async function getPostsInfoByIdAction(
  id: number,
): Promise<ActionState<any>> {
  try {
    const postInfo = await posts.getPostFullInfoById(id);
    if (!postInfo)
      return {
        success: false,
        type: "error",
        message: "게시판을 찾을 수 없습니다.",
      };

    return {
      success: true,
      message: "조회 성공",
      data: postInfo,
    };
  } catch (error) {
    return {
      success: false,
      type: "error",
      message: "정보를 불러오지 못했습니다.",
    };
  }
}

export async function getModuleByIdAdminAction(
  id: number,
): Promise<ActionState<any>> {
  try {
    const moduleInfo = await posts.getModuleById(id);
    if (!moduleInfo) {
      return {
        success: false,
        type: "error",
        message: "모듈을 찾을 수 없습니다.",
      };
    }
    return { success: true, message: "조회 성공", data: moduleInfo };
  } catch (error) {
    console.error("getModuleByIdAction Error:", error);
    return {
      success: false,
      type: "error",
      message: "모듈 정보를 불러오지 못했습니다.",
    };
  }
}

export async function removePostsAdminAction(
  ids: number[],
  paths?: string,
): Promise<ActionState<null>> {
  try {
    const loggedInfo = await getAuthenticatedUser();
    if (!loggedInfo?.isAdmin)
      return { success: false, message: "권한이 없습니다." };

    if (!ids || ids.length === 0) {
      return { success: false, message: "삭제할 항목을 선택해주세요." };
    }

    await query.deletePosts(ids);

    if (paths) {
      revalidatePath(paths);
    }

    return {
      success: true,
      type: "success",
      message: `${ids.length}개의 게시판이 삭제되었습니다.`,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "삭제 중 오류가 발생했습니다." };
  }
}

export async function savePostConfigAdminAction(
  mid: string,
  extraFields: ExtraFieldConfig[],
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user?.isAdmin) {
      return { success: false, error: "관리자 권한이 필요합니다." };
    }

    await posts.savePostConfig(mid, extraFields);

    // 2. 변경된 데이터를 화면에 즉시 반영하기 위해 캐시를 갱신합니다.
    revalidatePath(`/admin/posts/${mid}`);
    revalidatePath(`/posts/${mid}/write`);

    return { success: true };
  } catch (error) {
    console.error("[SavePostConfig Error]:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "설정 저장에 실패했습니다.",
    };
  }
}
