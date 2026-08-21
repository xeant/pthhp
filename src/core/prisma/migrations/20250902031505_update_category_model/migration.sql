/*
  Warnings:

  - You are about to drop the column `postId` on the `Category` table. All the data in the column will be lost.
  - Added the required column `order` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resourceType` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Category" DROP CONSTRAINT "Category_postId_fkey";

-- DropIndex
DROP INDEX "public"."idx_category_post";

-- AlterTable
ALTER TABLE "public"."Category" DROP COLUMN "postId",
ADD COLUMN     "order" INTEGER NOT NULL,
ADD COLUMN     "parentId" INTEGER,
ADD COLUMN     "resourceId" INTEGER,
ADD COLUMN     "resourceType" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "idx_category_parent" ON "public"."Category"("parentId");

-- CreateIndex
CREATE INDEX "idx_category_resource" ON "public"."Category"("resourceType", "resourceId");

-- AddForeignKey
ALTER TABLE "public"."Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
