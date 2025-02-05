/*
  Warnings:

  - You are about to drop the `provider_known_destination` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "provider_known_destination" DROP CONSTRAINT "provider_known_destination_connection_id_fkey";

-- DropTable
DROP TABLE "provider_known_destination";
