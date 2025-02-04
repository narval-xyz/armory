/*
  Warnings:

  - You are about to drop the column `admin_api_key` on the `engine` table. All the data in the column will be lost.
  - You are about to drop the column `master_key` on the `engine` table. All the data in the column will be lost.
  - Added the required column `encryption_keyring_type` to the `engine` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "engine" DROP COLUMN "admin_api_key",
DROP COLUMN "master_key",
ADD COLUMN     "admin_api_key_hash" TEXT,
ADD COLUMN     "auth_disabled" BOOLEAN,
ADD COLUMN     "encryption_keyring_type" TEXT NOT NULL,
ADD COLUMN     "encryption_master_aws_kms_arn" TEXT,
ADD COLUMN     "encryption_master_key" TEXT;

-- CreateTable
CREATE TABLE "client" (
    "client_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "configuration_source" TEXT NOT NULL,
    "base_url" TEXT,
    "auth_disabled" BOOLEAN NOT NULL,
    "client_secret" TEXT,
    "data_store_entity_data_url" TEXT NOT NULL,
    "data_store_entity_signature_url" TEXT NOT NULL,
    "data_store_entity_public_keys" TEXT NOT NULL,
    "data_store_policy_data_url" TEXT NOT NULL,
    "data_store_policy_signature_url" TEXT NOT NULL,
    "data_store_policy_public_keys" TEXT NOT NULL,
    "decision_attestation_disabled" BOOLEAN NOT NULL,
    "signer_alg" TEXT,
    "signer_key_id" TEXT,
    "signer_public_key" TEXT,
    "signer_private_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_pkey" PRIMARY KEY ("client_id")
);
