/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `Document` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Document" ADD COLUMN     "uuid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Document_uuid_key" ON "public"."Document"("uuid");
