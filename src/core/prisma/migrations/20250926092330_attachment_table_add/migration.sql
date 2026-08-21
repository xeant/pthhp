/*
  Warnings:

  - You are about to drop the column `slug` on the `Document` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Document" DROP COLUMN "slug";

-- CreateTable
CREATE TABLE "public"."Attachment" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "resourceId" INTEGER NOT NULL,
    "resourceType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "uploadedById" INTEGER,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Attachment_uuid_key" ON "public"."Attachment"("uuid");

-- CreateIndex
CREATE INDEX "idx_attachment_resource" ON "public"."Attachment"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "idx_attachment_user" ON "public"."Attachment"("uploadedById");

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
