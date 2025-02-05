/*
  Warnings:

  - Added the required column `raw_accounts` to the `provider_scoped_sync` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "provider_scoped_sync" ADD COLUMN     "raw_accounts" TEXT NOT NULL;
