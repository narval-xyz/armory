/*
  Warnings:

  - A unique constraint covering the columns `[client_id,external_id]` on the table `provider_account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[client_id,external_id]` on the table `provider_address` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[client_id,external_id]` on the table `provider_known_destination` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[client_id,external_id]` on the table `provider_wallet` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "provider_account_client_id_external_id_key" ON "provider_account"("client_id", "external_id");

-- CreateIndex
CREATE UNIQUE INDEX "provider_address_client_id_external_id_key" ON "provider_address"("client_id", "external_id");

-- CreateIndex
CREATE UNIQUE INDEX "provider_known_destination_client_id_external_id_key" ON "provider_known_destination"("client_id", "external_id");

-- CreateIndex
CREATE UNIQUE INDEX "provider_wallet_client_id_external_id_key" ON "provider_wallet"("client_id", "external_id");
