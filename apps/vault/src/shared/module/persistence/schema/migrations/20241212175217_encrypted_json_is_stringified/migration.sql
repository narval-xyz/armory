-- AlterTable
ALTER TABLE "provider_connection" ALTER COLUMN "credentials" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "transit_encryption_key" ALTER COLUMN "private_key" SET DATA TYPE TEXT,
ALTER COLUMN "public_key" SET DATA TYPE TEXT;
