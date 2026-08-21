-- AlterTable
ALTER TABLE "public"."Category" ALTER COLUMN "order" SET DEFAULT 0,
ALTER COLUMN "resourceType" SET DEFAULT 'posts';

-- CreateTable
CREATE TABLE "public"."Comment" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "documentId" INTEGER NOT NULL,
    "userId" INTEGER,
    "authorName" VARCHAR(45),
    "authorPassword" VARCHAR(255),
    "parentId" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "voteCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Comment_uuid_key" ON "public"."Comment"("uuid");

-- CreateIndex
CREATE INDEX "idx_comment_document" ON "public"."Comment"("documentId");

-- CreateIndex
CREATE INDEX "idx_comment_user" ON "public"."Comment"("userId");

-- CreateIndex
CREATE INDEX "idx_comment_parent" ON "public"."Comment"("parentId");

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
