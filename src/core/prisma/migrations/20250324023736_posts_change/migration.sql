/*
  Warnings:

  - You are about to drop the column `moduleId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `moduleId` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the `Module` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `postId` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postId` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_moduleId_fkey";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "moduleId",
ADD COLUMN     "postId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "moduleId",
ADD COLUMN     "postId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "profileImage" TEXT;

-- DropTable
DROP TABLE "Module";

-- CreateTable
CREATE TABLE "Posts" (
    "id" SERIAL NOT NULL,
    "pid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "postName" TEXT NOT NULL,
    "postDesc" TEXT,
    "grant" JSON,
    "config" JSON,
    "status" VARCHAR(45),

    CONSTRAINT "Posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Posts_pid_key" ON "Posts"("pid");

-- CreateIndex
CREATE UNIQUE INDEX "Posts_postName_key" ON "Posts"("postName");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
