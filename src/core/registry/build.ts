import type {
  AdminDashboardMap,
  AdminLayoutMap,
  AdminLayoutOption,
  PostLayoutMap,
  PostLayoutOption,
  PostSkinMap,
  PostSkinOption,
  UserLayoutMap,
  UserLayoutOption,
} from "@/core/registry/defaultRegistry";
import type {
  ExtensionRegistryConfig,
  RegistryOption,
} from "@/core/registry/define";
import type { AdminBreadcrumbRegistry, AdminMenuItem } from "@/core/registry/adminRegistry";

const toOption = <T extends RegistryOption>({ key, label, description }: T) => ({
  key,
  label,
  description,
});

export const buildExtensionRegistry = (...registries: ExtensionRegistryConfig[]) => {
  const postSkins: PostSkinMap = {};
  const postLayouts: PostLayoutMap = {};
  const adminLayouts: AdminLayoutMap = {};
  const adminDashboards: AdminDashboardMap = {};
  const userLayouts: UserLayoutMap = {};
  const adminMenus: AdminMenuItem[] = [];
  const adminBreadcrumbs: AdminBreadcrumbRegistry = {};
  const postSkinOptions = new Map<string, PostSkinOption>();
  const postLayoutOptions = new Map<string, PostLayoutOption>();
  const adminLayoutOptions = new Map<string, AdminLayoutOption>();
  const userLayoutOptions = new Map<string, UserLayoutOption>();

  const appendBreadcrumbs = (breadcrumbs?: AdminBreadcrumbRegistry) => {
    if (!breadcrumbs) return;

    Object.entries(breadcrumbs).forEach(([section, labels]) => {
      adminBreadcrumbs[section] = {
        ...(adminBreadcrumbs[section] || {}),
        ...labels,
      };
    });
  };

  const appendMenus = (menu?: AdminMenuItem | AdminMenuItem[]) => {
    if (!menu) return;
    adminMenus.push(...(Array.isArray(menu) ? menu : [menu]));
  };

  const appendPostSkin = (item: NonNullable<ExtensionRegistryConfig["postSkins"]>[number]) => {
    if (item.list) postSkins[item.key] = item.list;
    postSkinOptions.set(item.key, toOption(item) as PostSkinOption);
  };

  const appendPostLayout = (item: NonNullable<ExtensionRegistryConfig["postLayouts"]>[number]) => {
    postLayouts[item.key] = item.component;
    postLayoutOptions.set(item.key, toOption(item) as PostLayoutOption);
  };

  const appendAdminLayout = (item: NonNullable<ExtensionRegistryConfig["adminLayouts"]>[number]) => {
    adminLayouts[item.key] = item.component;
    if (item.dashboard) adminDashboards[item.key] = item.dashboard;
    adminLayoutOptions.set(item.key, toOption(item) as AdminLayoutOption);
  };

  const appendUserSkin = (item: NonNullable<ExtensionRegistryConfig["userSkins"]>[number]) => {
    userLayouts[item.key] = {
      timeline: item.timeline,
      update: item.update,
      preferences: item.preferences,
      delete: item.delete,
    };
    userLayoutOptions.set(item.key, toOption(item) as UserLayoutOption);
  };

  registries.forEach((source) => {
    source.modules?.forEach((module) => {
      appendMenus(module.admin?.menu);
      appendBreadcrumbs(module.admin?.breadcrumbs);
      module.postSkins?.forEach(appendPostSkin);
      module.postLayouts?.forEach(appendPostLayout);
      module.adminLayouts?.forEach(appendAdminLayout);
      module.userSkins?.forEach(appendUserSkin);
    });

    source.postSkins?.forEach(appendPostSkin);
    source.postLayouts?.forEach(appendPostLayout);
    source.adminLayouts?.forEach(appendAdminLayout);
    source.userSkins?.forEach(appendUserSkin);
  });

  return {
    postSkins,
    postLayouts,
    adminLayouts,
    adminDashboards,
    userLayouts,
    adminMenus: [...adminMenus].sort((a, b) => (a.order ?? 999) - (b.order ?? 999)),
    adminBreadcrumbs,
    postSkinOptions: Array.from(postSkinOptions.values()),
    postLayoutOptions: Array.from(postLayoutOptions.values()),
    adminLayoutOptions: Array.from(adminLayoutOptions.values()),
    userLayoutOptions: Array.from(userLayoutOptions.values()),
  };
};
