/*
  Warnings:

  - You are about to drop the column `postId` on the `Document` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,groupId]` on the table `UserGroupUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `resourceId` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resourceType` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_postId_fkey";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "postId",
ADD COLUMN     "resourceId" INTEGER NOT NULL,
ADD COLUMN     "resourceType" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "idx_category_post" ON "Category"("postId");

-- CreateIndex
CREATE INDEX "idx_document_resource" ON "Document"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "idx_document_category" ON "Document"("categoryId");

-- CreateIndex
CREATE INDEX "idx_document_user" ON "Document"("userId");

-- CreateIndex
CREATE INDEX "idx_posts_status" ON "Posts"("status");

-- CreateIndex
CREATE INDEX "idx_user_email" ON "User"("email_address");

-- CreateIndex
CREATE INDEX "idx_user_isAdmin" ON "User"("isAdmin");

-- CreateIndex
CREATE INDEX "idx_ugu_user" ON "UserGroupUser"("userId");

-- CreateIndex
CREATE INDEX "idx_ugu_group" ON "UserGroupUser"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "UserGroupUser_userId_groupId_key" ON "UserGroupUser"("userId", "groupId");
