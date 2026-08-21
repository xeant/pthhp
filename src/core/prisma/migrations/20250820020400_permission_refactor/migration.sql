/*
  Warnings:

  - You are about to drop the column `module` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `resource` on the `Permission` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uuid]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "module",
DROP COLUMN "resource",
ADD COLUMN     "resourceId" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "resourceType" TEXT NOT NULL DEFAULT 'unknown';

-- CreateIndex
CREATE INDEX "idx_permission_resource" ON "Permission"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "idx_permission_subject" ON "Permission"("subjectType", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");
