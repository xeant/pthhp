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
);

CREATE UNIQUE INDEX IF NOT EXISTS "SiteNavigationGroup_key_key" ON "SiteNavigationGroup"("key");
CREATE INDEX IF NOT EXISTS "idx_site_navigation_group_area" ON "SiteNavigationGroup"("area");
CREATE INDEX IF NOT EXISTS "idx_site_navigation_group_active" ON "SiteNavigationGroup"("isActive");

ALTER TABLE "SiteNavigation"
ADD COLUMN IF NOT EXISTS "groupId" INTEGER;

CREATE INDEX IF NOT EXISTS "idx_site_navigation_group" ON "SiteNavigation"("groupId");

INSERT INTO "SiteNavigationGroup" ("key", "title", "description", "area", "order", "isActive", "updatedAt")
VALUES
  ('header-main', '기본 상단 메뉴', '기본 레이아웃의 상단 네비게이션입니다.', 'header', 0, true, NOW()),
  ('footer', '기본 푸터 메뉴', '기본 레이아웃의 푸터 링크입니다.', 'footer', 10, true, NOW())
ON CONFLICT ("key") DO NOTHING;

UPDATE "SiteNavigation"
SET "groupId" = (
  SELECT "id"
  FROM "SiteNavigationGroup"
  WHERE "key" = CASE
    WHEN "SiteNavigation"."location" = 'footer' THEN 'footer'
    ELSE 'header-main'
  END
)
WHERE "groupId" IS NULL;

DO $$
BEGIN
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
