-- DropIndex
DROP INDEX "provider_network_provider_external_id_key";

-- AlterTable
ALTER TABLE "provider_network" ADD CONSTRAINT "provider_network_pkey" PRIMARY KEY ("provider", "external_id");
