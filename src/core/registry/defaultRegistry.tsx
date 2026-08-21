import type React from "react";

import AuthLayout from "@/layouts/auth/Layout";
import DefaultLayout from "@/layouts/default/Layout";
import HomePage from "@/core/registry/defaultHomePage";
import { buildExtensionRegistry } from "@/core/registry/build";
import { coreRegistry } from "@/core/registry/coreRegistry";

export type PostSkinMap = Record<string, React.ComponentType<any>>;
export type PostLayoutMap = Record<string, React.ComponentType<any>>;
export type AdminLayoutMap = Record<string, React.ComponentType<any>>;
export type AdminDashboardMap = Record<string, React.ComponentType<any>>;
export type UserLayoutComponents = {
  timeline: React.ComponentType<any>;
  update: React.ComponentType<any>;
  preferences: React.ComponentType<any>;
  delete: React.ComponentType<any>;
};
export type UserLayoutMap = Record<string, UserLayoutComponents>;
export type AdminLayoutOption = {
  key: string;
  label: string;
  description: string;
};
export type UserLayoutOption = {
  key: string;
  label: string;
  description: string;
};
export type PostSkinOption = {
  key: string;
  label: string;
  description: string;
};
export type PostLayoutOption = {
  key: string;
  label: string;
  description: string;
};

export const {
  postSkins,
  postLayouts,
  adminLayouts,
  adminDashboards,
  userLayouts,
  adminMenus,
  adminBreadcrumbs,
  postSkinOptions,
  postLayoutOptions,
  adminLayoutOptions,
  userLayoutOptions,
} = buildExtensionRegistry(coreRegistry);

export const AdminLayout = adminLayouts.default;

export { AuthLayout, DefaultLayout, HomePage };
