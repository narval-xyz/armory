/*
  Warnings:

  - You are about to drop the `data_store` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "data_store";

-- CreateTable
CREATE TABLE "entity_data_store" (
    "id" VARCHAR(255) NOT NULL,
    "org_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "version" INTEGER NOT NULL,

    CONSTRAINT "entity_data_store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_data_store" (
    "id" VARCHAR(255) NOT NULL,
    "org_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "version" INTEGER NOT NULL,

    CONSTRAINT "policy_data_store_pkey" PRIMARY KEY ("id")
);
