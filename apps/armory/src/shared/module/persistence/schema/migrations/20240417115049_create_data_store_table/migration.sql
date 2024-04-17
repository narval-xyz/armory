-- CreateTable
CREATE TABLE "data_store" (
    "id" VARCHAR(255) NOT NULL,
    "org_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "version" INTEGER NOT NULL,

    CONSTRAINT "data_store_pkey" PRIMARY KEY ("id")
);
