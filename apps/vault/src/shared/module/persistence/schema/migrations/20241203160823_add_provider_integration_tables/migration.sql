-- CreateTable
CREATE TABLE "provider_wallet" (
    "id" TEXT NOT NULL,
    "label" TEXT,
    "client_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_account" (
    "id" TEXT NOT NULL,
    "label" TEXT,
    "client_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "network_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_address" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_known_destination" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "external_classification" TEXT,
    "address" TEXT NOT NULL,
    "asset_id" TEXT,
    "network_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_known_destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_connection" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT,
    "credentials" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "_integrity" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "provider_connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_wallet_connection" (
    "client_id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_wallet_connection_pkey" PRIMARY KEY ("client_id","connection_id","wallet_id")
);

-- CreateTable
CREATE TABLE "provider_sync" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error_name" TEXT,
    "error_message" TEXT,
    "error_trace_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "provider_sync_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_transfer" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "source_wallet_id" TEXT,
    "source_account_id" TEXT,
    "source_address_id" TEXT,
    "provider" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_transfer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "provider_account" ADD CONSTRAINT "provider_account_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "provider_wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_address" ADD CONSTRAINT "provider_address_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "provider_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_known_destination" ADD CONSTRAINT "provider_known_destination_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "provider_connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_wallet_connection" ADD CONSTRAINT "provider_wallet_connection_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "provider_connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_wallet_connection" ADD CONSTRAINT "provider_wallet_connection_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "provider_wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_sync" ADD CONSTRAINT "provider_sync_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "provider_connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_transfer" ADD CONSTRAINT "provider_transfer_source_wallet_id_fkey" FOREIGN KEY ("source_wallet_id") REFERENCES "provider_wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_transfer" ADD CONSTRAINT "provider_transfer_source_account_id_fkey" FOREIGN KEY ("source_account_id") REFERENCES "provider_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_transfer" ADD CONSTRAINT "provider_transfer_source_address_id_fkey" FOREIGN KEY ("source_address_id") REFERENCES "provider_address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
