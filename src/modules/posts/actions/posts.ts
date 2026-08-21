import * as query from "./posts.query";
import { ExtraFieldConfig } from "./_type";

export const getModuleById = async (id: number) => {
  return await query.findModuleById(id);
};

export const getModuleByMid = async (mid: string) => {
  return await query.findModuleByMid(mid);
};

export const getPostsList = async (
  page: number = 1,
  pageSize: number = 10,
  keyword?: string,
  target: "mid" | "moduleName" = "moduleName",
) => {
  return await query.findPostsList(page, pageSize, keyword, target);
};

export const getPostFullInfo = async (mid: string) => {
  const postInfo = await query.findPostsByPid(mid);
  if (!postInfo) return null;

  const [permissions, categories] = await Promise.all([
    query.findPermissionsByModuleId(postInfo.id),
    query.findCategoriesByModuleId(postInfo.id),
  ]);

  const extraFields =
    (postInfo.FieldGroup?.fields as unknown as ExtraFieldConfig[]) || [];

  const mappedPermissions = {
    listPermissions: permissions
      .filter((p) => p.action === "list")
      .map((p) => ({ subjectType: p.subjectType, subjectId: p.subjectId })),
    readPermissions: permissions
      .filter((p) => p.action === "read")
      .map((p) => ({ subjectType: p.subjectType, subjectId: p.subjectId })),
    writePermissions: permissions
      .filter((p) => p.action === "write")
      .map((p) => ({ subjectType: p.subjectType, subjectId: p.subjectId })),
    commentPermissions: permissions
      .filter((p) => p.action === "comment")
      .map((p) => ({ subjectType: p.subjectType, subjectId: p.subjectId })),
  };

  return {
    ...postInfo,
    extraFields,
    permissions: mappedPermissions,
    categories,
  };
};

export const getPostFullInfoById = async (id: number) => {
  const postInfo = await query.findPostsById(id);
  if (!postInfo) return null;

  const [permissions, categories] = await Promise.all([
    query.findPermissionsByModuleId(postInfo.id),
    query.findCategoriesByModuleId(postInfo.id),
  ]);

  const extraFields =
    (postInfo.FieldGroup?.fields as unknown as ExtraFieldConfig[]) || [];

  const mappedPermissions = {
    listPermissions: permissions
      .filter((p) => p.action === "list")
      .map((p) => ({ subjectType: p.subjectType, subjectId: p.subjectId })),
    readPermissions: permissions
      .filter((p) => p.action === "read")
      .map((p) => ({ subjectType: p.subjectType, subjectId: p.subjectId })),
    writePermissions: permissions
      .filter((p) => p.action === "write")
      .map((p) => ({ subjectType: p.subjectType, subjectId: p.subjectId })),
    commentPermissions: permissions
      .filter((p) => p.action === "comment")
      .map((p) => ({ subjectType: p.subjectType, subjectId: p.subjectId })),
  };

  return {
    ...postInfo,
    extraFields,
    permissions: mappedPermissions,
    categories,
  };
};

export const savePostConfig = async (
  mid: string,
  extraFields: ExtraFieldConfig[],
) => {
  return await query.updateModuleFieldSchema(mid, extraFields);
};
