-- AlterTable
ALTER TABLE "approved_transfer" ADD COLUMN     "resource_id" TEXT;
UPDATE "approved_transfer" SET resource_id = '';
ALTER TABLE "approved_transfer" ALTER COLUMN   "resource_id" SET NOT NULL;