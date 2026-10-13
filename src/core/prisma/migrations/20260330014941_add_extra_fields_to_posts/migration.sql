-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "extraFieldData" JSONB DEFAULT '{}';

-- AlterTable
ALTER TABLE "Posts" ADD COLUMN     "extraFields" JSONB DEFAULT '[]';
