-- CreateEnum
CREATE TYPE "PermissionSubject" AS ENUM ('guest', 'member', 'admin', 'group');

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "module" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "subjectType" "PermissionSubject" NOT NULL,
    "subjectId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);
