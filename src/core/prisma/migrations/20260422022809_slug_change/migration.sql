/*
  Warnings:

  - Made the column `slug` on table `Category` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slug` on table `Document` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slug` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "slug" SET NOT NULL;
