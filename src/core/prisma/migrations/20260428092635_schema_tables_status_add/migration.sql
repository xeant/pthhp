-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "status" VARCHAR(45);

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "status" VARCHAR(45);

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "status" VARCHAR(45);

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "status" VARCHAR(45);

-- AlterTable
ALTER TABLE "FieldGroup" ADD COLUMN     "status" VARCHAR(45);

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "status" VARCHAR(45);

-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "status" VARCHAR(45);

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "status" VARCHAR(45);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" VARCHAR(45);
