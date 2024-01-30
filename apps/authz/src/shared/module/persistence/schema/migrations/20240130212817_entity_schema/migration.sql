/*
  Warnings:

  - The primary key for the `auth_credential` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `uid` to the `auth_credential` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "user_group" (
    "uid" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "user_group_membership" (
    "user_id" TEXT NOT NULL,
    "user_group_id" TEXT NOT NULL,

    PRIMARY KEY ("user_id", "user_group_id")
);

-- CreateTable
CREATE TABLE "wallet" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "account_type" TEXT NOT NULL,
    "chain_id" INTEGER
);

-- CreateTable
CREATE TABLE "WalletGroup" (
    "uid" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "wallet_group_membership" (
    "wallet_id" TEXT NOT NULL,
    "wallet_group_id" TEXT NOT NULL,

    PRIMARY KEY ("wallet_id", "wallet_group_id")
);

-- CreateTable
CREATE TABLE "user_wallet_assignment" (
    "user_id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,

    PRIMARY KEY ("user_id", "wallet_id")
);

-- CreateTable
CREATE TABLE "address_book_account" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "chain_id" TEXT NOT NULL,
    "classification" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "token" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "chain_id" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_auth_credential" (
    "uid" TEXT NOT NULL PRIMARY KEY,
    "pub_key" TEXT NOT NULL,
    "alg" TEXT NOT NULL,
    "user_id" TEXT NOT NULL
);
INSERT INTO "new_auth_credential" ("alg", "pub_key", "user_id") SELECT "alg", "pub_key", "user_id" FROM "auth_credential";
DROP TABLE "auth_credential";
ALTER TABLE "new_auth_credential" RENAME TO "auth_credential";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
