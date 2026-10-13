/*
  Warnings:

  - You are about to drop the column `documentId` on the `Attachment` table. All the data in the column will be lost.
  - You are about to drop the column `resourceId` on the `Attachment` table. All the data in the column will be lost.
  - You are about to drop the column `resourceType` on the `Attachment` table. All the data in the column will be lost.
  - You are about to drop the column `tempId` on the `Attachment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_documentId_fkey";

-- DropIndex
DROP INDEX "idx_attachment_resource";

-- AlterTable
ALTER TABLE "Attachment" DROP COLUMN "documentId",
DROP COLUMN "resourceId",
DROP COLUMN "resourceType",
DROP COLUMN "tempId";
