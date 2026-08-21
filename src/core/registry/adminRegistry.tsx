import type React from "react";

import { buildExtensionRegistry } from "@/core/registry/build";
import { coreRegistry } from "@/core/registry/coreRegistry";

export type AdminMenuChild = {
  label: string;
  href: string;
};

export type AdminMenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  items?: AdminMenuChild[];
  order?: number;
};

export type AdminBreadcrumbRegistry = Record<string, Record<string, string>>;

const { adminMenus: defaultAdminMenus, adminBreadcrumbs: defaultAdminBreadcrumbs } = buildExtensionRegistry(coreRegistry);

export const getAdminMenuRegistry = (): AdminMenuItem[] => {
  return defaultAdminMenus;
};

export const getAdminBreadcrumbRegistry = (): AdminBreadcrumbRegistry => {
  return defaultAdminBreadcrumbs;
};
