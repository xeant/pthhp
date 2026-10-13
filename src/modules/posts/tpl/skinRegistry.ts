import type React from "react";

import { postLayouts, postSkins } from "@extensions";

type PostSkinRegistry = {
  list: Record<string, React.ComponentType<any>>;
};
type PostLayoutRegistry = Record<string, React.ComponentType<any>>;

export const postSkinRegistry: PostSkinRegistry = {
  list: postSkins || {},
};

export const postLayoutRegistry: PostLayoutRegistry = postLayouts || {};

export function normalizeSkinName(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function normalizeLayoutName(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}
