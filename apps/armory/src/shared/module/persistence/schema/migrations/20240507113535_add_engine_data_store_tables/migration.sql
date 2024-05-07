/*
  Warnings:

  - Added the required column `engine_public_key` to the `organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entity_public_key` to the `organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `policy_public_key` to the `organization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "organization" ADD COLUMN     "engine_public_key" JSONB NOT NULL,
ADD COLUMN     "entity_public_key" JSONB NOT NULL,
ADD COLUMN     "policy_public_key" JSONB NOT NULL;

-- CreateTable
CREATE TABLE "engine" (
    "id" VARCHAR(255) NOT NULL,
    "org_id" TEXT NOT NULL,
    "client_secret" TEXT NOT NULL,
    "pub_key" JSONB NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "engine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_data_store" (
    "id" VARCHAR(255) NOT NULL,
    "org_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entity_data_store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_data_store" (
    "id" VARCHAR(255) NOT NULL,
    "org_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_data_store_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "engine" ADD CONSTRAINT "engine_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
