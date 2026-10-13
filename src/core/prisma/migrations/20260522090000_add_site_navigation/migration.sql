CREATE TABLE "SiteNavigation" (
    "id" SERIAL NOT NULL,
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
);

CREATE INDEX "idx_site_navigation_location" ON "SiteNavigation"("location");
CREATE INDEX "idx_site_navigation_parent" ON "SiteNavigation"("parentId");
CREATE INDEX "idx_site_navigation_active" ON "SiteNavigation"("isActive");

ALTER TABLE "SiteNavigation"
ADD CONSTRAINT "SiteNavigation_parentId_fkey"
FOREIGN KEY ("parentId") REFERENCES "SiteNavigation"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
