-- CreateTable
CREATE TABLE "engine" (
    "uid" TEXT NOT NULL,
    "master_key" TEXT NOT NULL,
    "admin_api_key" TEXT NOT NULL,

    CONSTRAINT "engine_pkey" PRIMARY KEY ("uid")
);
