-- CreateTable
CREATE TABLE "vault" (
    "id" TEXT NOT NULL,
    "master_key" TEXT,
    "admin_api_key" TEXT,

    CONSTRAINT "vault_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "key_value" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "key_value_pkey" PRIMARY KEY ("key")
);
