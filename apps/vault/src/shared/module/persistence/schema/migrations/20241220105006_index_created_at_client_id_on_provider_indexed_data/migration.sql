/*
  Warnings:

  - A unique constraint covering the columns `[client_id,external_id]` on the table `provider_transfer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "provider_account_created_at_client_id_idx" ON "provider_account"("created_at", "client_id");

-- CreateIndex
CREATE INDEX "provider_address_created_at_client_id_idx" ON "provider_address"("created_at", "client_id");

-- CreateIndex
CREATE INDEX "provider_connection_created_at_client_id_idx" ON "provider_connection"("created_at", "client_id");

-- CreateIndex
CREATE INDEX "provider_known_destination_created_at_client_id_idx" ON "provider_known_destination"("created_at", "client_id");

-- CreateIndex
CREATE INDEX "provider_transfer_created_at_client_id_idx" ON "provider_transfer"("created_at", "client_id");

-- CreateIndex
CREATE UNIQUE INDEX "provider_transfer_client_id_external_id_key" ON "provider_transfer"("client_id", "external_id");

-- CreateIndex
CREATE INDEX "provider_wallet_created_at_client_id_idx" ON "provider_wallet"("created_at", "client_id");
