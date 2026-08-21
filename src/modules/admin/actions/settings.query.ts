import prisma, { Prisma } from "@utils/db/prisma";

export type SettingSeed = {
  key: string;
  value: string;
  group: string;
  label: string;
  description?: string;
  isPublic?: boolean;
};

type SettingRecord = {
  key: string;
  value: string | null;
};

export type PublicSitemapEntry = {
  url: string;
  updatedAt: Date | null;
};

export const getSettingsByKeysQuery = async (keys: string[]) => {
  if (keys.length === 0) return [];

  return prisma.$queryRaw<SettingRecord[]>`
    SELECT "key", "value"
    FROM "AppSetting"
    WHERE "key" IN (${Prisma.join(keys)})
  `;
};

export const upsertSettingsQuery = async (settings: SettingSeed[]) => {
  if (settings.length === 0) return [];

  return prisma.$transaction(
    settings.map((setting) =>
      prisma.$executeRaw`
        INSERT INTO "AppSetting" (
          "key",
          "value",
          "group",
          "label",
          "description",
          "isPublic",
          "updatedAt"
        )
        VALUES (
          ${setting.key},
          ${setting.value},
          ${setting.group},
          ${setting.label},
          ${setting.description || null},
          ${setting.isPublic ?? false},
          NOW()
        )
        ON CONFLICT ("key")
        DO UPDATE SET
          "value" = EXCLUDED."value",
          "group" = EXCLUDED."group",
          "label" = EXCLUDED."label",
          "description" = EXCLUDED."description",
          "isPublic" = EXCLUDED."isPublic",
          "updatedAt" = NOW()
      `,
    ),
  );
};

export const getPublicPageSitemapEntriesQuery = async () => {
  return prisma.$queryRaw<PublicSitemapEntry[]>`
    SELECT
      CASE
        WHEN "href" = '/' THEN '/'
        ELSE "href"
      END AS "url",
      "updatedAt"
    FROM "SiteNavigation"
    WHERE "isActive" = true
      AND "visibility" = 'public'
      AND "href" IS NOT NULL
      AND "href" <> ''
      AND "href" NOT LIKE 'http%'
      AND "href" NOT LIKE '#%'
    ORDER BY "order" ASC, "id" ASC
  `;
};

export const getPublicPostSitemapEntriesQuery = async () => {
  return prisma.$queryRaw<PublicSitemapEntry[]>`
    SELECT
      CONCAT('/posts/', m."mid", '/', d."slug") AS "url",
      d."updatedAt"
    FROM "Document" d
    INNER JOIN "Modules" m ON m."id" = d."moduleId"
    WHERE d."moduleType" = 'posts'
      AND COALESCE(d."isSecrets", false) = false
      AND (d."published" = true OR d."published" IS NULL)
      AND d."slug" IS NOT NULL
      AND m."mid" IS NOT NULL
    ORDER BY d."updatedAt" DESC
    LIMIT 1000
  `;
};
