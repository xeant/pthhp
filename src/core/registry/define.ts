import type React from "react";
import type { UserLayoutComponents } from "@/core/registry/defaultRegistry";
import type { AdminBreadcrumbRegistry, AdminMenuItem } from "@/core/registry/adminRegistry";

export type RegistryOption = {
  key: string;
  label: string;
  description: string;
};

export type PostSkinRegistration = RegistryOption & {
  list?: React.ComponentType<any>;
};

export type PostLayoutRegistration = RegistryOption & {
  component: React.ComponentType<any>;
};

export type AdminLayoutRegistration = RegistryOption & {
  component: React.ComponentType<any>;
  dashboard?: React.ComponentType<any>;
};

export type UserSkinRegistration = RegistryOption & UserLayoutComponents;

export type ModuleRegistration = RegistryOption & {
  admin?: {
    menu?: AdminMenuItem | AdminMenuItem[];
    breadcrumbs?: AdminBreadcrumbRegistry;
  };
  postSkins?: PostSkinRegistration[];
  postLayouts?: PostLayoutRegistration[];
  adminLayouts?: AdminLayoutRegistration[];
  userSkins?: UserSkinRegistration[];
};

export type ExtensionRegistryConfig = {
  modules?: ModuleRegistration[];
  postSkins?: PostSkinRegistration[];
  postLayouts?: PostLayoutRegistration[];
  adminLayouts?: AdminLayoutRegistration[];
  userSkins?: UserSkinRegistration[];
};

export const defineModule = (config: ModuleRegistration) => config;
export const definePostSkin = (config: PostSkinRegistration) => config;
export const definePostLayout = (config: PostLayoutRegistration) => config;
export const defineAdminLayout = (config: AdminLayoutRegistration) => config;
export const defineUserSkin = (config: UserSkinRegistration) => config;
export const defineExtensionRegistry = (config: ExtensionRegistryConfig) => config;
