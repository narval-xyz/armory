-- AlterTable
ALTER TABLE "provider_transfer" ADD COLUMN     "asset_external_id" TEXT,
ALTER COLUMN "asset_id" DROP NOT NULL;
