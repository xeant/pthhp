import prisma, { Prisma } from "@utils/db/prisma";
import type { SiteNavigationGroupParams, SiteNavigationParams } from "./_type";

export type SiteNavigationSeed = Omit<SiteNavigationParams, "id" | "parentId" | "groupId"> & {
  children?: SiteNavigationSeed[];
};

export type SiteNavigationGroupSeed = Omit<SiteNavigationGroupParams, "id">;

type SiteNavigationRecord = {
  id: number;
  groupId: number | null;
  groupKey: string;
  groupTitle: string;
  groupArea: string;
  parentId: number | null;
  name: string;
  title: string;
  href: string;
  target: string | null;
  icon: string | null;
  order: number;
  depth: number;
  location: string;
  visibility: string;
  isActive: boolean;
  status: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SiteNavigationGroupRecord = {
  id: number;
  key: string;
  title: string;
  description: string | null;
  area: string;
  order: number;
  isActive: boolean;
  status: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type CountRecord = {
  count: bigint;
};

const getLegacyLocationByGroupKey = (groupKey: string) => {
  if (groupKey.startsWith("footer")) return "footer";
  if (groupKey.startsWith("side")) return "side";
  return "header";
};

export const ensureSiteNavigationTableQuery = async () => {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "SiteNavigationGroup" (
      "id" SERIAL NOT NULL,
      "key" VARCHAR(100) NOT NULL,
      "title" VARCHAR(120) NOT NULL,
      "description" TEXT,
      "area" VARCHAR(45) NOT NULL DEFAULT 'custom',
      "order" INTEGER NOT NULL DEFAULT 0,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "status" VARCHAR(45),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "SiteNavigationGroup_pkey" PRIMARY KEY ("id")
    )
  `;

  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "SiteNavigation" (
      "id" SERIAL NOT NULL,
      "groupId" INTEGER,
      "parentId" INTEGER,
      "name" VARCHAR(100) NOT NULL,
      "title" VARCHAR(120) NOT NULL,
      "href" TEXT NOT NULL,
      "target" VARCHAR(20),
      "icon" VARCHAR(60),
      "order" INTEGER NOT NULL DEFAULT 0,
      "depth" INTEGER NOT NULL DEFAULT 0,
      "location" VARCHAR(45) NOT NULL DEFAULT 'header',
      "visibility" VARCHAR(45) NOT NULL DEFAULT 'public',
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "status" VARCHAR(45),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "SiteNavigation_pkey" PRIMARY KEY ("id")
    )
  `;

  await prisma.$executeRaw`
    ALTER TABLE "SiteNavigation"
    ADD COLUMN IF NOT EXISTS "groupId" INTEGER
  `;

  await prisma.$executeRaw`
    CREATE UNIQUE INDEX IF NOT EXISTS "SiteNavigationGroup_key_key" ON "SiteNavigationGroup"("key")
  `;
  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS "idx_site_navigation_group_area" ON "SiteNavigationGroup"("area")
  `;
  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS "idx_site_navigation_group_active" ON "SiteNavigationGroup"("isActive")
  `;
  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS "idx_site_navigation_group" ON "SiteNavigation"("groupId")
  `;
  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS "idx_site_navigation_location" ON "SiteNavigation"("location")
  `;
  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS "idx_site_navigation_parent" ON "SiteNavigation"("parentId")
  `;
  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS "idx_site_navigation_active" ON "SiteNavigation"("isActive")
  `;
  await prisma.$executeRaw`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'SiteNavigation_parentId_fkey'
      ) THEN
        ALTER TABLE "SiteNavigation"
        ADD CONSTRAINT "SiteNavigation_parentId_fkey"
        FOREIGN KEY ("parentId") REFERENCES "SiteNavigation"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;

      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'SiteNavigation_groupId_fkey'
      ) THEN
        ALTER TABLE "SiteNavigation"
        ADD CONSTRAINT "SiteNavigation_groupId_fkey"
        FOREIGN KEY ("groupId") REFERENCES "SiteNavigationGroup"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$;
  `;
};

export const countSiteNavigationItemsQuery = async () => {
  const rows = await prisma.$queryRaw<CountRecord[]>`
    SELECT COUNT(*)::bigint AS "count"
    FROM "SiteNavigation"
  `;

  return Number(rows[0]?.count || 0);
};

export const getSiteNavigationGroupsQuery = async (includeInactive = true) => {
  return prisma.$queryRaw<SiteNavigationGroupRecord[]>`
    SELECT
      "id",
      "key",
      "title",
      "description",
      "area",
      "order",
      "isActive",
      "status",
      "createdAt",
      "updatedAt"
    FROM "SiteNavigationGroup"
    WHERE 1 = 1
      ${includeInactive ? Prisma.empty : Prisma.sql`AND "isActive" = true`}
    ORDER BY "area" ASC, "order" ASC, "id" ASC
  `;
};

export const upsertSiteNavigationGroupsQuery = async (groups: SiteNavigationGroupSeed[]) => {
  if (groups.length === 0) return [];

  return prisma.$transaction(
    groups.map((group) =>
      prisma.$executeRaw`
        INSERT INTO "SiteNavigationGroup" (
          "key",
          "title",
          "description",
          "area",
          "order",
          "isActive",
          "updatedAt"
        )
        VALUES (
          ${group.key},
          ${group.title},
          ${group.description || null},
          ${group.area},
          ${group.order || 0},
          ${group.isActive},
          NOW()
        )
        ON CONFLICT ("key") DO NOTHING
      `,
    ),
  );
};

export const createSiteNavigationGroupQuery = async (data: SiteNavigationGroupParams) => {
  const rows = await prisma.$queryRaw<SiteNavigationGroupRecord[]>`
    INSERT INTO "SiteNavigationGroup" (
      "key",
      "title",
      "description",
      "area",
      "order",
      "isActive",
      "updatedAt"
    )
    VALUES (
      ${data.key},
      ${data.title},
      ${data.description || null},
      ${data.area},
      ${data.order || 0},
      ${data.isActive},
      NOW()
    )
    RETURNING *
  `;

  return rows[0];
};

export const updateSiteNavigationGroupQuery = async (data: SiteNavigationGroupParams) => {
  if (!data.id) throw new Error("수정할 그룹 ID가 없습니다.");

  const rows = await prisma.$queryRaw<SiteNavigationGroupRecord[]>`
    UPDATE "SiteNavigationGroup"
    SET
      "key" = ${data.key},
      "title" = ${data.title},
      "description" = ${data.description || null},
      "area" = ${data.area},
      "order" = ${data.order || 0},
      "isActive" = ${data.isActive},
      "updatedAt" = NOW()
    WHERE "id" = ${data.id}
    RETURNING *
  `;

  return rows[0];
};

export const deleteSiteNavigationGroupQuery = async (id: number) => {
  return prisma.$executeRaw`
    DELETE FROM "SiteNavigationGroup"
    WHERE "id" = ${id}
  `;
};

export const reorderSiteNavigationGroupsQuery = async (orderedKeys: string[]) => {
  if (orderedKeys.length === 0) return [];

  return prisma.$transaction(
    orderedKeys.map((key, index) =>
      prisma.$executeRaw`
        UPDATE "SiteNavigationGroup"
        SET
          "order" = ${index * 10},
          "updatedAt" = NOW()
        WHERE "key" = ${key}
      `,
    ),
  );
};

export const getSiteNavigationItemsQuery = async (groupKey?: string, includeInactive = true) => {
  return prisma.$queryRaw<SiteNavigationRecord[]>`
    SELECT
      nav."id",
      nav."groupId",
      COALESCE(nav_group."key", nav."location") AS "groupKey",
      COALESCE(nav_group."title", nav."location") AS "groupTitle",
      COALESCE(nav_group."area", nav."location") AS "groupArea",
      nav."parentId",
      nav."name",
      nav."title",
      nav."href",
      nav."target",
      nav."icon",
      nav."order",
      nav."depth",
      nav."location",
      nav."visibility",
      nav."isActive",
      nav."status",
      nav."createdAt",
      nav."updatedAt"
    FROM "SiteNavigation" nav
    LEFT JOIN "SiteNavigationGroup" nav_group ON nav_group."id" = nav."groupId"
    WHERE 1 = 1
      ${groupKey ? Prisma.sql`AND COALESCE(nav_group."key", nav."location") = ${groupKey}` : Prisma.empty}
      ${includeInactive ? Prisma.empty : Prisma.sql`AND nav."isActive" = true AND nav."visibility" = 'public' AND COALESCE(nav_group."isActive", true) = true`}
    ORDER BY COALESCE(nav_group."area", nav."location") ASC, COALESCE(nav_group."order", 0) ASC, nav."parentId" ASC NULLS FIRST, nav."order" ASC, nav."id" ASC
  `;
};

const getNavigationGroupByKeyQuery = async (groupKey: string) => {
  const rows = await prisma.$queryRaw<SiteNavigationGroupRecord[]>`
    SELECT *
    FROM "SiteNavigationGroup"
    WHERE "key" = ${groupKey}
    LIMIT 1
  `;

  return rows[0] || null;
};

const getNavigationGroupIdByKeyQuery = async (groupKey: string) => {
  const group = await getNavigationGroupByKeyQuery(groupKey);
  if (!group) throw new Error(`존재하지 않는 메뉴 그룹입니다: ${groupKey}`);

  return group.id;
};

export const createSiteNavigationItemQuery = async (data: SiteNavigationParams) => {
  const depth = data.parentId ? 1 : 0;
  const groupId = await getNavigationGroupIdByKeyQuery(data.groupKey);

  const rows = await prisma.$queryRaw<SiteNavigationRecord[]>`
    INSERT INTO "SiteNavigation" (
      "groupId",
      "parentId",
      "name",
      "title",
      "href",
      "target",
      "icon",
      "order",
      "depth",
      "location",
      "visibility",
      "isActive",
      "updatedAt"
    )
    VALUES (
      ${groupId},
      ${data.parentId || null},
      ${data.name},
      ${data.title},
      ${data.href},
      ${data.target || null},
      ${data.icon || null},
      ${data.order || 0},
      ${depth},
      ${data.location || getLegacyLocationByGroupKey(data.groupKey)},
      ${data.visibility},
      ${data.isActive},
      NOW()
    )
    RETURNING *
  `;

  return rows[0];
};

export const updateSiteNavigationItemQuery = async (data: SiteNavigationParams) => {
  if (!data.id) throw new Error("수정할 메뉴 ID가 없습니다.");

  const depth = data.parentId ? 1 : 0;
  const groupId = await getNavigationGroupIdByKeyQuery(data.groupKey);

  const rows = await prisma.$queryRaw<SiteNavigationRecord[]>`
    UPDATE "SiteNavigation"
    SET
      "groupId" = ${groupId},
      "parentId" = ${data.parentId || null},
      "name" = ${data.name},
      "title" = ${data.title},
      "href" = ${data.href},
      "target" = ${data.target || null},
      "icon" = ${data.icon || null},
      "order" = ${data.order || 0},
      "depth" = ${depth},
      "location" = ${data.location || getLegacyLocationByGroupKey(data.groupKey)},
      "visibility" = ${data.visibility},
      "isActive" = ${data.isActive},
      "updatedAt" = NOW()
    WHERE "id" = ${data.id}
    RETURNING *
  `;

  return rows[0];
};

export const deleteSiteNavigationItemQuery = async (id: number) => {
  return prisma.$executeRaw`
    DELETE FROM "SiteNavigation"
    WHERE "id" = ${id}
  `;
};

export const moveSiteNavigationItemQuery = async ({
  itemId,
  groupKey,
  parentId,
  orderedIds,
}: {
  itemId: number;
  groupKey: string;
  parentId: number | null;
  orderedIds: number[];
}) => {
  const group = await getNavigationGroupByKeyQuery(groupKey);
  if (!group) throw new Error(`존재하지 않는 메뉴 그룹입니다: ${groupKey}`);

  const location = group.area || getLegacyLocationByGroupKey(groupKey);
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      WITH RECURSIVE moved_items AS (
        SELECT "id"
        FROM "SiteNavigation"
        WHERE "id" = ${itemId}
        UNION ALL
        SELECT child."id"
        FROM "SiteNavigation" child
        INNER JOIN moved_items parent ON child."parentId" = parent."id"
      )
      UPDATE "SiteNavigation"
      SET
        "groupId" = ${group.id},
        "location" = ${location},
        "updatedAt" = NOW()
      WHERE "id" IN (SELECT "id" FROM moved_items)
    `;

    await tx.$executeRaw`
      UPDATE "SiteNavigation"
      SET
        "parentId" = ${parentId},
        "updatedAt" = NOW()
      WHERE "id" = ${itemId}
    `;

    await tx.$executeRaw`
      WITH RECURSIVE menu_tree AS (
        SELECT
          nav."id",
          CASE
            WHEN nav."parentId" IS NULL THEN 0
            ELSE COALESCE(parent."depth", 0) + 1
          END AS "nextDepth"
        FROM "SiteNavigation" nav
        LEFT JOIN "SiteNavigation" parent ON parent."id" = nav."parentId"
        WHERE nav."id" = ${itemId}

        UNION ALL

        SELECT
          child."id",
          menu_tree."nextDepth" + 1
        FROM "SiteNavigation" child
        INNER JOIN menu_tree ON child."parentId" = menu_tree."id"
      )
      UPDATE "SiteNavigation" nav
      SET
        "depth" = menu_tree."nextDepth",
        "updatedAt" = NOW()
      FROM menu_tree
      WHERE nav."id" = menu_tree."id"
    `;

    await Promise.all(
      orderedIds.map((id, index) =>
        tx.$executeRaw`
          UPDATE "SiteNavigation"
          SET
            "order" = ${index * 10},
            "updatedAt" = NOW()
          WHERE "id" = ${id}
        `,
      ),
    );
  });
};

export const attachLegacyNavigationItemsToGroupsQuery = async () => {
  await prisma.$executeRaw`
    UPDATE "SiteNavigation"
    SET "groupId" = (
      SELECT "id"
      FROM "SiteNavigationGroup"
      WHERE "key" = CASE
        WHEN "SiteNavigation"."location" = 'footer' THEN 'footer'
        ELSE 'header-main'
      END
    )
    WHERE "groupId" IS NULL
  `;
};

export const seedSiteNavigationItemsQuery = async (items: SiteNavigationSeed[]) => {
  if (items.length === 0) return [];

  return prisma.$transaction(async (tx) => {
    const created: Array<{ id: number }> = [];

    for (const item of items) {
      const group = await tx.$queryRaw<SiteNavigationGroupRecord[]>`
        SELECT *
        FROM "SiteNavigationGroup"
        WHERE "key" = ${item.groupKey}
        LIMIT 1
      `;
      const groupId = group[0]?.id;
      if (!groupId) throw new Error(`존재하지 않는 메뉴 그룹입니다: ${item.groupKey}`);

      const parentRows = await tx.$queryRaw<SiteNavigationRecord[]>`
        INSERT INTO "SiteNavigation" (
          "groupId",
          "name",
          "title",
          "href",
          "target",
          "icon",
          "order",
          "depth",
          "location",
          "visibility",
          "isActive",
          "updatedAt"
        )
        VALUES (
          ${groupId},
          ${item.name},
          ${item.title},
          ${item.href},
          ${item.target || null},
          ${item.icon || null},
          ${item.order || 0},
          0,
          ${item.location || getLegacyLocationByGroupKey(item.groupKey)},
          ${item.visibility},
          ${item.isActive},
          NOW()
        )
        RETURNING *
      `;
      const parent = parentRows[0];

      created.push(parent);

      if (!item.children?.length) continue;

      for (const child of item.children) {
        const childRows = await tx.$queryRaw<SiteNavigationRecord[]>`
          INSERT INTO "SiteNavigation" (
            "groupId",
            "parentId",
            "name",
            "title",
            "href",
            "target",
            "icon",
            "order",
            "depth",
            "location",
            "visibility",
            "isActive",
            "updatedAt"
          )
          VALUES (
            ${groupId},
            ${parent.id},
            ${child.name},
            ${child.title},
            ${child.href},
            ${child.target || null},
            ${child.icon || null},
            ${child.order || 0},
            1,
            ${child.location || getLegacyLocationByGroupKey(child.groupKey)},
            ${child.visibility},
            ${child.isActive},
            NOW()
          )
          RETURNING *
        `;
        const createdChild = childRows[0];

        created.push(createdChild);
      }
    }

    return created;
  });
};
