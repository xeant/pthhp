/*
  Warnings:

  - You are about to drop the column `resourceId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `resourceType` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `resourceId` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `resourceType` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `resourceId` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `resourceType` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the `Posts` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `moduleId` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moduleType` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "idx_category_resource";

-- DropIndex
DROP INDEX "idx_document_resource";

-- DropIndex
DROP INDEX "idx_permission_resource";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "resourceId",
DROP COLUMN "resourceType",
ADD COLUMN     "moduleId" INTEGER,
ADD COLUMN     "moduleType" TEXT NOT NULL DEFAULT 'modules';

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "resourceId",
DROP COLUMN "resourceType",
ADD COLUMN     "fieldGroupId" INTEGER,
ADD COLUMN     "moduleId" INTEGER NOT NULL,
ADD COLUMN     "moduleType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "resourceId",
DROP COLUMN "resourceType",
ADD COLUMN     "moduleId" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "moduleType" TEXT NOT NULL DEFAULT 'unknown';

-- DropTable
DROP TABLE "Posts";

-- CreateTable
CREATE TABLE "Modules" (
    "id" SERIAL NOT NULL,
    "mid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "moduleName" TEXT NOT NULL,
    "moduleDesc" TEXT,
    "grant" JSON,
    "config" JSON,
    "status" VARCHAR(45),
    "fieldGroupId" INTEGER,

    CONSTRAINT "Modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "fields" JSONB NOT NULL,

    CONSTRAINT "FieldGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Modules_mid_key" ON "Modules"("mid");

-- CreateIndex
CREATE UNIQUE INDEX "Modules_moduleName_key" ON "Modules"("moduleName");

-- CreateIndex
CREATE INDEX "idx_modules_status" ON "Modules"("status");

-- CreateIndex
CREATE UNIQUE INDEX "FieldGroup_name_key" ON "FieldGroup"("name");

-- CreateIndex
CREATE INDEX "idx_category_module" ON "Category"("moduleType", "moduleId");

-- CreateIndex
CREATE INDEX "idx_document_module" ON "Document"("moduleType", "moduleId");

-- CreateIndex
CREATE INDEX "idx_permission_module" ON "Permission"("moduleType", "moduleId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_fieldGroupId_fkey" FOREIGN KEY ("fieldGroupId") REFERENCES "FieldGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Modules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modules" ADD CONSTRAINT "Modules_fieldGroupId_fkey" FOREIGN KEY ("fieldGroupId") REFERENCES "FieldGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
