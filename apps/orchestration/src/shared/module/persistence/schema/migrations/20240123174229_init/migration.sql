-- CreateEnum
CREATE TYPE "AuthorizationRequestStatus" AS ENUM ('CREATED', 'FAILED', 'CANCELED', 'PROCESSING', 'APPROVING', 'PERMITTED', 'FORBIDDEN');

-- CreateEnum
CREATE TYPE "AuthorizationRequestAction" AS ENUM ('signTransaction', 'signMessage');

-- CreateTable
CREATE TABLE "organization" (
    "id" VARCHAR(255) NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authorization_request" (
    "id" VARCHAR(255) NOT NULL,
    "org_id" TEXT NOT NULL,
    "status" "AuthorizationRequestStatus" NOT NULL DEFAULT 'CREATED',
    "action" "AuthorizationRequestAction" NOT NULL,
    "request" JSONB NOT NULL,
    "idempotency_key" TEXT,
    "authn_sig" TEXT NOT NULL,
    "authn_alg" TEXT NOT NULL,
    "authn_pub_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authorization_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authorization_request_approval" (
    "id" VARCHAR(255) NOT NULL,
    "request_id" TEXT NOT NULL,
    "sig" TEXT NOT NULL,
    "alg" TEXT NOT NULL,
    "pub_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authorization_request_approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_log" (
    "id" VARCHAR(255) NOT NULL,
    "org_id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "signature" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluation_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_feed" (
    "id" VARCHAR(255) NOT NULL,
    "org_id" TEXT NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "rates" JSONB NOT NULL,
    "initiated_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transfer_feed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "authorization_request_idempotency_key_key" ON "authorization_request"("idempotency_key");

-- AddForeignKey
ALTER TABLE "authorization_request_approval" ADD CONSTRAINT "authorization_request_approval_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "authorization_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_log" ADD CONSTRAINT "evaluation_log_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "authorization_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
