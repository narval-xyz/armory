-- CreateTable
CREATE TABLE "engine" (
    "id" TEXT NOT NULL,
    "master_key" TEXT,
    "admin_api_key" TEXT,

    CONSTRAINT "engine_pkey" PRIMARY KEY ("id")
);
