/*
  Warnings:

  - You are about to drop the column `org_id` on the `approved_transfer` table. All the data in the column will be lost.
  - You are about to drop the column `org_id` on the `authorization_request` table. All the data in the column will be lost.
  - You are about to drop the column `org_id` on the `engine` table. All the data in the column will be lost.
  - You are about to drop the column `org_id` on the `entity_data_store` table. All the data in the column will be lost.
  - You are about to drop the column `org_id` on the `evaluation_log` table. All the data in the column will be lost.
  - You are about to drop the column `org_id` on the `feed` table. All the data in the column will be lost.
  - You are about to drop the column `org_id` on the `policy_data_store` table. All the data in the column will be lost.
  - You are about to drop the `organization` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `client_id` to the `approved_transfer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `client_id` to the `authorization_request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `client_id` to the `engine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `client_id` to the `entity_data_store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `client_id` to the `evaluation_log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `client_id` to the `feed` table without a default value. This is not possible if the table is not empty.
  - Added the required column `client_id` to the `policy_data_store` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "engine" DROP CONSTRAINT "engine_org_id_fkey";

-- AlterTable
ALTER TABLE "approved_transfer" DROP COLUMN "org_id",
ADD COLUMN     "client_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "authorization_request" DROP COLUMN "org_id",
ADD COLUMN     "client_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "engine" DROP COLUMN "org_id",
ADD COLUMN     "client_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "entity_data_store" DROP COLUMN "org_id",
ADD COLUMN     "client_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "evaluation_log" DROP COLUMN "org_id",
ADD COLUMN     "client_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "feed" DROP COLUMN "org_id",
ADD COLUMN     "client_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "policy_data_store" DROP COLUMN "org_id",
ADD COLUMN     "client_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "organization";

-- CreateTable
CREATE TABLE "client" (
    "id" VARCHAR(255) NOT NULL,
    "name" TEXT NOT NULL,
    "engine_public_key" JSONB NOT NULL,
    "entity_public_key" JSONB NOT NULL,
    "policy_public_key" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "engine" ADD CONSTRAINT "engine_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
