/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Document` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Document_slug_key" ON "Document"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_slug_key" ON "User"("slug");
