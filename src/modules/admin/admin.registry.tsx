import type { AdminMenuItem } from "@/core/registry/adminRegistry";
import { adminModule } from "@/modules/admin/registry";

export const adminAdminMenus: AdminMenuItem[] = Array.isArray(adminModule.admin?.menu)
  ? adminModule.admin.menu
  : adminModule.admin?.menu
    ? [adminModule.admin.menu]
    : [];

export const adminAdminBreadcrumbs = adminModule.admin?.breadcrumbs || {};
