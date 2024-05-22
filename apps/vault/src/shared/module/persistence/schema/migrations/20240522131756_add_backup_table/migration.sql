-- CreateTable
CREATE TABLE "backup" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "backup_public_key_hash" TEXT NOT NULL,
    "key_id" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backup_pkey" PRIMARY KEY ("id")
);
