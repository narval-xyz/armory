/*
  Warnings:

  - Added the required column `collection` to the `key_value` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "key_value" ADD COLUMN     "client_id" TEXT,
ADD COLUMN     "collection" TEXT NOT NULL;
