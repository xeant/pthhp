"use server";

import { revalidatePath } from "next/cache";

import { getUserSessionAction } from "@/modules/user/actions/user.action";
import redisClient from "@utils/redis/redis";
import { validateForm } from "@utils/validation/formValidator";
import {
  ActionState,
  SiteNavigationAdminData,
  SiteNavigationGroupItem,
  SiteNavigationGroupSchema,
  SiteNavigationItem,
  SiteNavigationParams,
  SiteNavigationSchema,
} from "./_type";
import {
  attachLegacyNavigationItemsToGroupsQuery,
  countSiteNavigationItemsQuery,
  createSiteNavigationGroupQuery,
  createSiteNavigationItemQuery,
  deleteSiteNavigationGroupQuery,
  deleteSiteNavigationItemQuery,
  ensureSiteNavigationTableQuery,
  getSiteNavigationGroupsQuery,
  getSiteNavigationItemsQuery,
  moveSiteNavigationItemQuery,
  reorderSiteNavigationGroupsQuery,
  SiteNavigationGroupSeed,
  seedSiteNavigationItemsQuery,
  SiteNavigationSeed,
  updateSiteNavigationGroupQuery,
  updateSiteNavigationItemQuery,
  upsertSiteNavigationGroupsQuery,
} from "./sitemap.query";

const SITE_NAVIGATION_CACHE_PREFIX = "app:navigation";
const SITE_NAVIGATION_CACHE_TTL = 60 * 60 * 24;

const DEFAULT_SITE_NAVIGATION_GROUPS: SiteNavigationGroupSeed[] = [
  {
    key: "header-main",
    title: "기본 상단 메뉴",
    description: "기본 레이아웃의 상단 네비게이션입니다.",
    area: "header",
    order: 0,
    isActive: true,
  },
  {
    key: "footer",
    title: "기본 푸터 메뉴",
    description: "기본 레이아웃의 푸터 링크입니다.",
    area: "footer",
    order: 10,
    isActive: true,
  },
  {
    key: "footer-partners",
    title: "푸터 파트너 메뉴",
    description: "푸터 Partners 영역에 표시되는 메뉴입니다.",
    area: "footer",
    order: 11,
    isActive: true,
  },
  {
    key: "footer-developer",
    title: "푸터 개발자 메뉴",
    description: "푸터 Developer 영역에 표시되는 메뉴입니다.",
    area: "footer",
    order: 12,
    isActive: true,
  },
];

const DEFAULT_SITE_NAVIGATION: SiteNavigationSeed[] = [
  {
    groupKey: "header-main",
    name: "home",
    title: "Home",
    href: "/",
    order: 0,
    location: "header",
    visibility: "public",
    isActive: true,
  },
  {
    groupKey: "header-main",
    name: "features",
    title: "Features",
    href: "/features",
    order: 10,
    location: "header",
    visibility: "public",
    isActive: true,
  },
  {
    groupKey: "header-main",
    name: "labs",
    title: "Labs",
    href: "/posts/labs",
    order: 20,
    location: "header",
    visibility: "public",
    isActive: true,
  },
  {
    groupKey: "header-main",
    name: "supports",
    title: "Supports",
    href: "/posts/notice",
    order: 30,
    location: "header",
    visibility: "public",
    isActive: true,
    children: [
      {
        groupKey: "header-main",
        name: "notice",
        title: "공지사항",
        href: "/posts/notice",
        order: 0,
        location: "header",
        visibility: "public",
        isActive: true,
      },
      {
        groupKey: "header-main",
        name: "changelog",
        title: "업데이트 내역",
        href: "/posts/changelog",
        order: 10,
        location: "header",
        visibility: "public",
        isActive: true,
      },
    ],
  },
  {
    groupKey: "header-main",
    name: "contact",
    title: "Contact",
    href: "/contact",
    order: 40,
    location: "header",
    visibility: "public",
    isActive: true,
  },
  {
    groupKey: "footer",
    name: "features-footer",
    title: "ABOUT",
    href: "/about",
    order: 0,
    location: "footer",
    visibility: "public",
    isActive: true,
  },
  {
    groupKey: "footer",
    name: "terms-footer",
    title: "Terms of service",
    href: "/terms",
    order: 10,
    location: "footer",
    visibility: "public",
    isActive: true,
  },
  {
    groupKey: "footer",
    name: "privacy-footer",
    title: "Privacy policy",
    href: "/privacy",
    order: 20,
    location: "footer",
    visibility: "public",
    isActive: true,
  },
  {
    groupKey: "footer-partners",
    name: "partner-center",
    title: "파트너 센터",
    href: "/public",
    order: 0,
    location: "footer",
    visibility: "public",
    isActive: true,
  },
  {
    groupKey: "footer-partners",
    name: "partner-apply",
    title: "파트너 신청",
    href: "/public",
    order: 10,
    location: "footer",
    visibility: "public",
    isActive: true,
  },
  {
    groupKey: "footer-developer",
    name: "documentation",
    title: "Documentation",
    href: "/features/getting-started",
    order: 0,
    location: "footer",
    visibility: "public",
    isActive: true,
  },
  {
    groupKey: "footer-developer",
    name: "orders",
    title: "구매내역",
    href: "/public",
    order: 10,
    location: "footer",
    visibility: "public",
    isActive: true,
  },
  {
    groupKey: "footer-developer",
    name: "store",
    title: "스토어",
    href: "/posts/store",
    order: 20,
    location: "footer",
    visibility: "public",
    isActive: true,
  },
  {
    groupKey: "footer-developer",
    name: "license",
    title: "License",
    href: "/license",
    order: 30,
    location: "footer",
    visibility: "public",
    isActive: true,
  },
];

const buildNavigationTree = (items: Awaited<ReturnType<typeof getSiteNavigationItemsQuery>>): SiteNavigationItem[] => {
  const map = new Map<number, SiteNavigationItem>();
  const roots: SiteNavigationItem[] = [];

  items.forEach((item) => {
    map.set(item.id, {
      id: item.id,
      groupId: item.groupId,
      groupKey: item.groupKey,
      groupTitle: item.groupTitle,
      groupArea: item.groupArea,
      parentId: item.parentId,
      name: item.name,
      title: item.title,
      href: item.href,
      target: item.target,
      icon: item.icon,
      order: item.order,
      depth: item.depth,
      location: item.location,
      visibility: item.visibility,
      isActive: item.isActive,
      children: [],
    });
  });

  map.forEach((item) => {
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)?.children.push(item);
      return;
    }

    roots.push(item);
  });

  const sortTree = (list: SiteNavigationItem[]) => {
    list.sort((a, b) => a.order - b.order || a.id - b.id);
    list.forEach((item) => sortTree(item.children));
  };

  sortTree(roots);

  return roots;
};

const ensureDefaultSiteNavigationAction = async () => {
  await ensureSiteNavigationTableQuery();
  await upsertSiteNavigationGroupsQuery(DEFAULT_SITE_NAVIGATION_GROUPS);
  await attachLegacyNavigationItemsToGroupsQuery();

  const count = await countSiteNavigationItemsQuery();
  if (count > 0) return;

  await seedSiteNavigationItemsQuery(DEFAULT_SITE_NAVIGATION);
};

const getNavigationCacheKey = (groupKey: string) => `${SITE_NAVIGATION_CACHE_PREFIX}:${groupKey}`;

const readSiteNavigationCache = async (groupKey: string): Promise<SiteNavigationItem[] | null> => {
  try {
    const cached = await redisClient.get(getNavigationCacheKey(groupKey));
    if (!cached) return null;

    return JSON.parse(cached) as SiteNavigationItem[];
  } catch (error) {
    console.warn("readSiteNavigationCache Warning:", error);
    return null;
  }
};

const writeSiteNavigationCache = async (groupKey: string, data: SiteNavigationItem[]) => {
  try {
    await redisClient.set(
      getNavigationCacheKey(groupKey),
      JSON.stringify(data),
      "EX",
      SITE_NAVIGATION_CACHE_TTL,
    );
  } catch (error) {
    console.warn("writeSiteNavigationCache Warning:", error);
  }
};

const clearSiteNavigationCache = async () => {
  try {
    const groups = await getSiteNavigationGroupsQuery();
    await Promise.all(groups.map((group) => redisClient.del(getNavigationCacheKey(group.key))));
  } catch (error) {
    console.warn("clearSiteNavigationCache Warning:", error);
  }
};

const getSiteNavigationFormPayload = (formData: FormData) => ({
  id: formData.get("id") || undefined,
  groupKey: formData.get("groupKey"),
  parentId: formData.get("parentId") || null,
  name: formData.get("name"),
  title: formData.get("title"),
  href: formData.get("href"),
  target: formData.get("target") || "",
  icon: formData.get("icon") || "",
  order: formData.get("order") || 0,
  location: formData.get("location"),
  visibility: formData.get("visibility"),
  isActive: formData.get("isActive") === "on",
});

const getSiteNavigationGroupFormPayload = (formData: FormData) => ({
  id: formData.get("groupId") || undefined,
  key: formData.get("key"),
  title: formData.get("groupTitle"),
  description: formData.get("description") || "",
  area: formData.get("area"),
  order: formData.get("groupOrder") || 0,
  isActive: formData.get("groupIsActive") === "on",
});

const normalizeNavigationData = (data: SiteNavigationParams): SiteNavigationParams => ({
  ...data,
  parentId: data.parentId || null,
  target: data.target || "",
  icon: data.icon || "",
});

const mapNavigationGroups = (groups: Awaited<ReturnType<typeof getSiteNavigationGroupsQuery>>): SiteNavigationGroupItem[] => {
  return groups.map((group) => ({
    id: group.id,
    key: group.key,
    title: group.title,
    description: group.description,
    area: group.area,
    order: group.order,
    isActive: group.isActive,
  }));
};

const getSiteNavigationAdminData = async (): Promise<SiteNavigationAdminData> => {
  const [groups, items] = await Promise.all([
    getSiteNavigationGroupsQuery(),
    getSiteNavigationItemsQuery(),
  ]);

  return {
    groups: mapNavigationGroups(groups),
    items: buildNavigationTree(items),
  };
};

export const getSiteNavigationAdminAction = async (): Promise<ActionState<SiteNavigationAdminData>> => {
  const sessionInfo = await getUserSessionAction();

  if (!sessionInfo?.data?.isAdmin) {
    return { success: false, type: "error", message: "관리자 권한이 필요합니다." };
  }

  try {
    await ensureDefaultSiteNavigationAction();

    return {
      success: true,
      type: "success",
      message: "사이트맵을 불러왔습니다.",
      data: await getSiteNavigationAdminData(),
    };
  } catch (error) {
    console.error("getSiteNavigationAdminAction Error:", error);
    return { success: false, type: "error", message: "사이트맵을 불러오지 못했습니다." };
  }
};

export const getPublicSiteNavigationAction = async (groupKey = "header-main"): Promise<ActionState<SiteNavigationItem[]>> => {
  try {
    const cached = await readSiteNavigationCache(groupKey);
    if (cached) {
      return {
        success: true,
        type: "success",
        message: "사이트맵을 불러왔습니다.",
        data: cached,
      };
    }

    await ensureDefaultSiteNavigationAction();
    const items = await getSiteNavigationItemsQuery(groupKey, false);
    const data = buildNavigationTree(items);
    await writeSiteNavigationCache(groupKey, data);

    return {
      success: true,
      type: "success",
      message: "사이트맵을 불러왔습니다.",
      data,
    };
  } catch (error) {
    console.error("getPublicSiteNavigationAction Error:", error);
    return {
      success: false,
      type: "error",
      message: "사이트맵을 불러오지 못했습니다.",
      data: [],
    };
  }
};

export const saveSiteNavigationGroupAdminAction = async (formData: FormData): Promise<ActionState<SiteNavigationAdminData>> => {
  const sessionInfo = await getUserSessionAction();

  if (!sessionInfo?.data?.isAdmin) {
    return { success: false, type: "error", message: "관리자 권한이 필요합니다." };
  }

  const validation = validateForm(SiteNavigationGroupSchema, getSiteNavigationGroupFormPayload(formData));
  if (!validation.isValid) return validation.errorResponse;

  try {
    await ensureDefaultSiteNavigationAction();

    if (validation.data.id) {
      await updateSiteNavigationGroupQuery(validation.data);
    } else {
      await createSiteNavigationGroupQuery(validation.data);
    }

    await attachLegacyNavigationItemsToGroupsQuery();
    await clearSiteNavigationCache();
    revalidatePath("/");
    revalidatePath("/admin/site/sitemap");

    return {
      success: true,
      type: "success",
      message: validation.data.id ? "메뉴 그룹이 수정되었습니다." : "메뉴 그룹이 추가되었습니다.",
      data: await getSiteNavigationAdminData(),
    };
  } catch (error) {
    console.error("saveSiteNavigationGroupAdminAction Error:", error);
    return { success: false, type: "error", message: "메뉴 그룹 저장에 실패했습니다." };
  }
};

export const removeSiteNavigationGroupAdminAction = async (id: number): Promise<ActionState<SiteNavigationAdminData>> => {
  const sessionInfo = await getUserSessionAction();

  if (!sessionInfo?.data?.isAdmin) {
    return { success: false, type: "error", message: "관리자 권한이 필요합니다." };
  }

  try {
    await deleteSiteNavigationGroupQuery(id);
    await clearSiteNavigationCache();
    revalidatePath("/");
    revalidatePath("/admin/site/sitemap");

    return {
      success: true,
      type: "success",
      message: "메뉴 그룹이 삭제되었습니다.",
      data: await getSiteNavigationAdminData(),
    };
  } catch (error) {
    console.error("removeSiteNavigationGroupAdminAction Error:", error);
    return { success: false, type: "error", message: "메뉴 그룹 삭제에 실패했습니다." };
  }
};

export const saveSiteNavigationAdminAction = async (formData: FormData): Promise<ActionState<SiteNavigationAdminData>> => {
  const sessionInfo = await getUserSessionAction();

  if (!sessionInfo?.data?.isAdmin) {
    return { success: false, type: "error", message: "관리자 권한이 필요합니다." };
  }

  const validation = validateForm(SiteNavigationSchema, getSiteNavigationFormPayload(formData));
  if (!validation.isValid) return validation.errorResponse;

  const data = normalizeNavigationData(validation.data);

  if (data.id && data.parentId === data.id) {
    return {
      success: false,
      type: "error",
      message: "자기 자신을 상위 메뉴로 지정할 수 없습니다.",
      fieldErrors: { parentId: "자기 자신을 상위 메뉴로 지정할 수 없습니다." },
    };
  }

  try {
    await ensureDefaultSiteNavigationAction();

    if (data.id) {
      await updateSiteNavigationItemQuery(data);
    } else {
      await createSiteNavigationItemQuery(data);
    }

    await clearSiteNavigationCache();
    revalidatePath("/");
    revalidatePath("/admin/site/sitemap");

    return {
      success: true,
      type: "success",
      message: data.id ? "메뉴가 수정되었습니다." : "메뉴가 추가되었습니다.",
      data: await getSiteNavigationAdminData(),
    };
  } catch (error) {
    console.error("saveSiteNavigationAdminAction Error:", error);
    return { success: false, type: "error", message: "사이트맵 저장에 실패했습니다." };
  }
};

export const removeSiteNavigationAdminAction = async (id: number): Promise<ActionState<SiteNavigationAdminData>> => {
  const sessionInfo = await getUserSessionAction();

  if (!sessionInfo?.data?.isAdmin) {
    return { success: false, type: "error", message: "관리자 권한이 필요합니다." };
  }

  try {
    await deleteSiteNavigationItemQuery(id);
    await clearSiteNavigationCache();
    revalidatePath("/");
    revalidatePath("/admin/site/sitemap");

    return {
      success: true,
      type: "success",
      message: "메뉴가 삭제되었습니다.",
      data: await getSiteNavigationAdminData(),
    };
  } catch (error) {
    console.error("removeSiteNavigationAdminAction Error:", error);
    return { success: false, type: "error", message: "메뉴 삭제에 실패했습니다." };
  }
};

export const moveSiteNavigationAdminAction = async ({
  itemId,
  groupKey,
  parentId,
  orderedIds,
}: {
  itemId: number;
  groupKey: string;
  parentId: number | null;
  orderedIds: number[];
}): Promise<ActionState<SiteNavigationAdminData>> => {
  const sessionInfo = await getUserSessionAction();

  if (!sessionInfo?.data?.isAdmin) {
    return { success: false, type: "error", message: "관리자 권한이 필요합니다." };
  }

  if (!itemId || !groupKey || orderedIds.length === 0) {
    return { success: false, type: "error", message: "이동할 메뉴 정보가 올바르지 않습니다." };
  }

  try {
    await ensureDefaultSiteNavigationAction();
    await moveSiteNavigationItemQuery({
      itemId,
      groupKey,
      parentId,
      orderedIds,
    });
    await clearSiteNavigationCache();
    revalidatePath("/");
    revalidatePath("/admin/site/sitemap");

    return {
      success: true,
      type: "success",
      message: "메뉴 위치가 변경되었습니다.",
      data: await getSiteNavigationAdminData(),
    };
  } catch (error) {
    console.error("moveSiteNavigationAdminAction Error:", error);
    return { success: false, type: "error", message: "메뉴 이동에 실패했습니다." };
  }
};

export const reorderSiteNavigationGroupsAdminAction = async (
  orderedKeys: string[],
): Promise<ActionState<SiteNavigationAdminData>> => {
  const sessionInfo = await getUserSessionAction();

  if (!sessionInfo?.data?.isAdmin) {
    return { success: false, type: "error", message: "관리자 권한이 필요합니다." };
  }

  if (orderedKeys.length === 0) {
    return { success: false, type: "error", message: "정렬할 그룹 정보가 없습니다." };
  }

  try {
    await ensureDefaultSiteNavigationAction();
    await reorderSiteNavigationGroupsQuery(orderedKeys);
    await clearSiteNavigationCache();
    revalidatePath("/");
    revalidatePath("/admin/site/sitemap");

    return {
      success: true,
      type: "success",
      message: "메뉴 그룹 순서가 변경되었습니다.",
      data: await getSiteNavigationAdminData(),
    };
  } catch (error) {
    console.error("reorderSiteNavigationGroupsAdminAction Error:", error);
    return { success: false, type: "error", message: "메뉴 그룹 정렬에 실패했습니다." };
  }
};
