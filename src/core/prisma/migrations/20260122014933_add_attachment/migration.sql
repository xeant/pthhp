-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;
