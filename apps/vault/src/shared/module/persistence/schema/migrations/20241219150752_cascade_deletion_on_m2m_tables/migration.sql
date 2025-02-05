-- DropForeignKey
ALTER TABLE "provider_wallet_connection" DROP CONSTRAINT "provider_wallet_connection_connection_id_fkey";

-- DropForeignKey
ALTER TABLE "provider_wallet_connection" DROP CONSTRAINT "provider_wallet_connection_wallet_id_fkey";

-- AddForeignKey
ALTER TABLE "provider_wallet_connection" ADD CONSTRAINT "provider_wallet_connection_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "provider_connection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_wallet_connection" ADD CONSTRAINT "provider_wallet_connection_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "provider_wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
