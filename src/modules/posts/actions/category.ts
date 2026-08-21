import * as query from "./category.query";
import { TreeItem } from "./_type";

export function listToTree(list: TreeItem[]): TreeItem[] {
  const map: { [key: string]: number } = {};
  const tree: TreeItem[] = [];

  list.forEach((node, i) => {
    map[node.id] = i;
    node.children = [];
  });

  list.forEach((node) => {
    if (node.parentId !== null && map[node.parentId] !== undefined) {
      list[map[node.parentId]].children.push(node);
    } else {
      tree.push(node);
    }
  });
  return tree;
}

export const getCategories = async (
  moduleId: number,
  moduleType: string = "posts",
) => {
  const data = await query.findCategoriesByModuleId(moduleType, moduleId);
  return listToTree(data);
};

export const addCategory = async (params: {
  title: string;
  parentId: string | null;
  moduleId: number;
  moduleType: string;
}) => {
  let numericParentId: number | null = null;

  if (
    params.parentId &&
    params.parentId !== "null" &&
    params.parentId !== "0" &&
    params.parentId !== ""
  ) {
    numericParentId = Number(params.parentId);
    if (isNaN(numericParentId)) {
      numericParentId = null;
    }
  }

  return await query.insertCategory({
    title: params.title,
    parentId: numericParentId,
    moduleId: params.moduleId,
    moduleType: params.moduleType,
    order: 0,
  });
};

export const renameCategory = async (id: number, title: string) => {
  return await query.updateCategoryTitle(id, title);
};

export const removeCategory = async (id: number) => {
  return await query.deleteCategoryRecursive(id);
};

export const saveCategoryTree = async (
  items: TreeItem[],
  moduleType: string = "posts",
) => {
  return await query.syncCategoryTree(items, moduleType);
};
