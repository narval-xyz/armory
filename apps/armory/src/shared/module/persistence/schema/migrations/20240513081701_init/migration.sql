-- CreateEnum
CREATE TYPE "AuthorizationRequestStatus" AS ENUM ('CREATED', 'FAILED', 'CANCELED', 'PROCESSING', 'APPROVING', 'PERMITTED', 'FORBIDDEN');

-- CreateTable
CREATE TABLE "client" (
    "id" VARCHAR(255) NOT NULL,
    "name" TEXT NOT NULL,
    "engine_public_key" JSONB NOT NULL,
    "entity_public_key" JSONB NOT NULL,
    "policy_public_key" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engine" (
    "id" VARCHAR(255) NOT NULL,
    "client_id" TEXT NOT NULL,
    "client_secret" TEXT NOT NULL,
    "pub_key" JSONB NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "engine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authorization_request" (
    "id" VARCHAR(255) NOT NULL,
    "client_id" TEXT NOT NULL,
    "status" "AuthorizationRequestStatus" NOT NULL DEFAULT 'CREATED',
    "action" TEXT NOT NULL,
    "request" JSONB NOT NULL,
    "idempotency_key" TEXT,
    "authn_sig" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authorization_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authorization_request_approval" (
    "id" VARCHAR(255) NOT NULL,
    "request_id" TEXT NOT NULL,
    "sig" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authorization_request_approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_log" (
    "id" VARCHAR(255) NOT NULL,
    "client_id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "signature" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluation_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approved_transfer" (
    "id" VARCHAR(255) NOT NULL,
    "client_id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "rates" JSONB NOT NULL,
    "initiated_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approved_transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feed" (
    "id" VARCHAR(255) NOT NULL,
    "client_id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sig" TEXT,
    "alg" TEXT,
    "pub_key" TEXT,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_data_store" (
    "id" VARCHAR(255) NOT NULL,
    "client_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entity_data_store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_data_store" (
    "id" VARCHAR(255) NOT NULL,
    "client_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_data_store_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "authorization_request_idempotency_key_key" ON "authorization_request"("idempotency_key");

-- AddForeignKey
ALTER TABLE "engine" ADD CONSTRAINT "engine_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "authorization_request_approval" ADD CONSTRAINT "authorization_request_approval_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "authorization_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_log" ADD CONSTRAINT "evaluation_log_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "authorization_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
