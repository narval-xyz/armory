-- AlterTable
ALTER TABLE "provider_connection" ALTER COLUMN "_integrity" DROP NOT NULL;

-- AlterTable
ALTER TABLE "vault" ADD COLUMN     "encryption_master_key" TEXT;
-- Copy over the old spelling to the new spelling
UPDATE vault SET encryption_master_key = enncryption_master_key
WHERE enncryption_master_key IS NOT NULL;

