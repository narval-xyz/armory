-- CreateTable
CREATE TABLE "transit_encryption_key" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "private_key" JSONB NOT NULL,
    "public_key" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transit_encryption_key_pkey" PRIMARY KEY ("id")
);
