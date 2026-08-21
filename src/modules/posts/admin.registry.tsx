import type { AdminMenuItem } from "@/core/registry/adminRegistry";
import { postsModule } from "@/modules/posts/registry";

export const postsAdminMenus: AdminMenuItem[] = Array.isArray(postsModule.admin?.menu)
  ? postsModule.admin.menu
  : postsModule.admin?.menu
    ? [postsModule.admin.menu]
    : [];

export const postsAdminBreadcrumbs = postsModule.admin?.breadcrumbs || {};
