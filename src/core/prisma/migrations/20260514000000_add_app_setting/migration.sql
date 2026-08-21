-- CreateTable
CREATE TABLE "AppSetting" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "group" VARCHAR(45) NOT NULL DEFAULT 'general',
    "label" VARCHAR(100),
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(45),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppSetting_key_key" ON "AppSetting"("key");

-- CreateIndex
CREATE INDEX "idx_app_setting_group" ON "AppSetting"("group");

-- CreateIndex
CREATE INDEX "idx_app_setting_public" ON "AppSetting"("isPublic");
