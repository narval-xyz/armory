-- CreateTable
CREATE TABLE "encryption_key" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "private_key" JSONB NOT NULL,
    "public_key" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "encryption_key_pkey" PRIMARY KEY ("id")
);
