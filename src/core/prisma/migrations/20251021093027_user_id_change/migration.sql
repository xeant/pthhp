/*
  Warnings:

  - You are about to drop the column `uploadedById` on the `Attachment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Attachment" DROP CONSTRAINT "Attachment_uploadedById_fkey";

-- DropIndex
DROP INDEX "public"."idx_attachment_user";

-- AlterTable
ALTER TABLE "public"."Attachment" DROP COLUMN "uploadedById",
ADD COLUMN     "userId" INTEGER;

-- CreateIndex
CREATE INDEX "idx_attachment_user" ON "public"."Attachment"("userId");

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
