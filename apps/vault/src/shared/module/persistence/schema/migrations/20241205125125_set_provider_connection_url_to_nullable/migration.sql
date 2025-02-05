/*
  Warnings:

  - Added the required column `request` to the `provider_transfer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "provider_connection" ALTER COLUMN "url" DROP NOT NULL,
ALTER COLUMN "credentials" DROP NOT NULL,
ALTER COLUMN "created_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "provider_transfer" ADD COLUMN     "request" JSONB NOT NULL;
