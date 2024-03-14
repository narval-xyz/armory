/*
  Warnings:

  - You are about to drop the column `authn_alg` on the `authorization_request` table. All the data in the column will be lost.
  - You are about to drop the column `authn_pub_key` on the `authorization_request` table. All the data in the column will be lost.
  - You are about to drop the column `alg` on the `authorization_request_approval` table. All the data in the column will be lost.
  - You are about to drop the column `pub_key` on the `authorization_request_approval` table. All the data in the column will be lost.
  - You are about to drop the `address_book_account_entity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `auth_credential_entity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `organization_entity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `token_entity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_entity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_group_entity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_group_member_entity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_wallet_entity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `wallet_entity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `wallet_group_entity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `wallet_group_member_entity` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_group_member_entity" DROP CONSTRAINT "user_group_member_entity_user_group_uid_fkey";

-- DropForeignKey
ALTER TABLE "user_group_member_entity" DROP CONSTRAINT "user_group_member_entity_user_uid_fkey";

-- DropForeignKey
ALTER TABLE "user_wallet_entity" DROP CONSTRAINT "user_wallet_entity_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_wallet_entity" DROP CONSTRAINT "user_wallet_entity_wallet_id_fkey";

-- DropForeignKey
ALTER TABLE "wallet_group_member_entity" DROP CONSTRAINT "wallet_group_member_entity_wallet_group_uid_fkey";

-- DropForeignKey
ALTER TABLE "wallet_group_member_entity" DROP CONSTRAINT "wallet_group_member_entity_wallet_uid_fkey";

-- AlterTable
ALTER TABLE "authorization_request" DROP COLUMN "authn_alg",
DROP COLUMN "authn_pub_key";

-- AlterTable
ALTER TABLE "authorization_request_approval" DROP COLUMN "alg",
DROP COLUMN "pub_key";

-- DropTable
DROP TABLE "address_book_account_entity";

-- DropTable
DROP TABLE "auth_credential_entity";

-- DropTable
DROP TABLE "organization_entity";

-- DropTable
DROP TABLE "token_entity";

-- DropTable
DROP TABLE "user_entity";

-- DropTable
DROP TABLE "user_group_entity";

-- DropTable
DROP TABLE "user_group_member_entity";

-- DropTable
DROP TABLE "user_wallet_entity";

-- DropTable
DROP TABLE "wallet_entity";

-- DropTable
DROP TABLE "wallet_group_entity";

-- DropTable
DROP TABLE "wallet_group_member_entity";
