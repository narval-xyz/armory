/*
  Warnings:

  - You are about to drop the column `request` on the `provider_transfer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[client_id,idempotence_id]` on the table `provider_transfer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `asset_id` to the `provider_transfer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gross_amount` to the `provider_transfer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `network_fee_attribution` to the `provider_transfer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "provider_known_destination_connection" DROP CONSTRAINT "provider_known_destination_connection_known_destination_id_fkey";

-- AlterTable
ALTER TABLE "provider_transfer" DROP COLUMN "request",
ADD COLUMN     "asset_id" TEXT NOT NULL,
ADD COLUMN     "customer_ref_id" TEXT,
ADD COLUMN     "destination_account_id" TEXT,
ADD COLUMN     "destination_address_id" TEXT,
ADD COLUMN     "destination_address_raw" TEXT,
ADD COLUMN     "destination_wallet_id" TEXT,
ADD COLUMN     "gross_amount" TEXT NOT NULL,
ADD COLUMN     "idempotence_id" TEXT,
ADD COLUMN     "memo" TEXT,
ADD COLUMN     "network_fee_attribution" TEXT NOT NULL,
ADD COLUMN     "provider_specific" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "provider_transfer_client_id_idempotence_id_key" ON "provider_transfer"("client_id", "idempotence_id");

-- AddForeignKey
ALTER TABLE "provider_known_destination_connection" ADD CONSTRAINT "provider_known_destination_connection_known_destination_id_fkey" FOREIGN KEY ("known_destination_id") REFERENCES "provider_known_destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_transfer" ADD CONSTRAINT "provider_transfer_destination_wallet_id_fkey" FOREIGN KEY ("destination_wallet_id") REFERENCES "provider_wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_transfer" ADD CONSTRAINT "provider_transfer_destination_account_id_fkey" FOREIGN KEY ("destination_account_id") REFERENCES "provider_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_transfer" ADD CONSTRAINT "provider_transfer_destination_address_id_fkey" FOREIGN KEY ("destination_address_id") REFERENCES "provider_address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
