-- CreateTable
CREATE TABLE "engine" (
    "id" TEXT NOT NULL,
    "master_key" TEXT,
    "admin_api_key" TEXT,

    CONSTRAINT "engine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "key_value" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "key_value_pkey" PRIMARY KEY ("key")
);
