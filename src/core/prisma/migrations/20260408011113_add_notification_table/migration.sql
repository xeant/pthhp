-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('info', 'success', 'warning', 'error');

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'info',
    "title" VARCHAR(100),
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "linkUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Notification_uuid_key" ON "Notification"("uuid");

-- CreateIndex
CREATE INDEX "idx_notification_user" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "idx_notification_unread" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "idx_notification_created" ON "Notification"("createdAt");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
