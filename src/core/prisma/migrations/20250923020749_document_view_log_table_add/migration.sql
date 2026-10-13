-- CreateTable
CREATE TABLE "public"."DocumentViewLog" (
    "id" SERIAL NOT NULL,
    "documentId" INTEGER NOT NULL,
    "userId" INTEGER,
    "ipAddress" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentViewLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentViewLog_documentId_userId_idx" ON "public"."DocumentViewLog"("documentId", "userId");

-- CreateIndex
CREATE INDEX "DocumentViewLog_documentId_ipAddress_idx" ON "public"."DocumentViewLog"("documentId", "ipAddress");
