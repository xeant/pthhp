/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Comment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Comment_slug_key" ON "Comment"("slug");
