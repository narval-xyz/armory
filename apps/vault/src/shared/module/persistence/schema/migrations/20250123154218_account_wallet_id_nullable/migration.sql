-- DropForeignKey
ALTER TABLE "provider_account" DROP CONSTRAINT "provider_account_wallet_id_fkey";

-- AlterTable
ALTER TABLE "provider_account" ALTER COLUMN "wallet_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "provider_account" ADD CONSTRAINT "provider_account_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "provider_wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
