import type { AdminMenuItem } from "@/core/registry/adminRegistry";
import { userModule } from "@/modules/user/registry";

export const userAdminMenus: AdminMenuItem[] = Array.isArray(userModule.admin?.menu)
  ? userModule.admin.menu
  : userModule.admin?.menu
    ? [userModule.admin.menu]
    : [];

export const userAdminBreadcrumbs = userModule.admin?.breadcrumbs || {};
