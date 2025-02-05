/*
  Warnings:
  - You are about to drop the column `connection_id` on the `provider_known_destination` table. All the data in the column will be lost.
*/

-- DropForeignKey
ALTER TABLE "provider_known_destination" DROP CONSTRAINT "provider_known_destination_connection_id_fkey";

-- AlterTable
ALTER TABLE "provider_known_destination" DROP COLUMN "connection_id",
ADD COLUMN     "label" TEXT;

-- CreateTable
CREATE TABLE "provider_known_destination_connection" (
    "client_id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "known_destination_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_known_destination_connection_pkey" PRIMARY KEY ("client_id","connection_id","known_destination_id")
);

-- AddForeignKey
ALTER TABLE "provider_known_destination_connection" ADD CONSTRAINT "provider_known_destination_connection_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "provider_connection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_known_destination_connection" ADD CONSTRAINT "provider_known_destination_connection_known_destination_id_fkey" FOREIGN KEY ("known_destination_id") REFERENCES "provider_known_destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
