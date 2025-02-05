/*
  Warnings:

  - You are about to drop the column `admin_api_key` on the `vault` table. All the data in the column will be lost.
  - You are about to drop the column `master_key` on the `vault` table. All the data in the column will be lost.
  - Added the required column `encryption_keyring_type` to the `vault` table without a default value. This is not possible if the table is not empty.

*/

-- AlterTable
ALTER TABLE "vault" DROP COLUMN "admin_api_key",
DROP COLUMN "master_key",
ADD COLUMN     "admin_api_key_hash" TEXT,
ADD COLUMN     "auth_disabled" BOOLEAN,
ADD COLUMN     "encryption_keyring_type" TEXT NOT NULL,
ADD COLUMN     "encryption_master_aws_kms_arn" TEXT,
ADD COLUMN     "enncryption_master_key" TEXT;

-- CreateTable
CREATE TABLE "client" (
    "client_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "configuration_source" TEXT NOT NULL,
    "auth_disabled" BOOLEAN NOT NULL,
    "token_validation_disabled" BOOLEAN NOT NULL,
    "backup_public_key" TEXT,
    "base_url" TEXT,
    "authorization_server_url" TEXT,
    "authorization_issuer" TEXT,
    "authorization_audience" TEXT,
    "authorization_max_token_age" INTEGER,
    "authorization_jwks_url" TEXT,
    "authorization_pinned_public_key" TEXT,
    "authorization_require_bound_tokens" BOOLEAN NOT NULL,
    "authorization_allow_bearer_tokens" BOOLEAN NOT NULL,
    "authorization_allow_wildcards" TEXT,
    "local_auth_allowed_users_jwks_url" TEXT,
    "local_auth_jwsd_enabled" BOOLEAN NOT NULL,
    "jwsd_max_age" INTEGER,
    "jwsd_required_components" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_pkey" PRIMARY KEY ("client_id")
);

-- CreateTable
CREATE TABLE "client_local_auth_allowed_user" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_local_auth_allowed_user_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "client_local_auth_allowed_user" ADD CONSTRAINT "client_local_auth_allowed_user_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("client_id") ON DELETE RESTRICT ON UPDATE CASCADE;
