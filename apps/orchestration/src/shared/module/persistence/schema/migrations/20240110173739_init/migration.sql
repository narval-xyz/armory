-- CreateEnum
CREATE TYPE "AuthorizationRequestStatus" AS ENUM ('CREATED', 'CANCELED', 'PROCESSING', 'APPROVING', 'PERMITTED', 'FORBIDDEN');

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
    "orgId" TEXT NOT NULL,
    "initiator_id" TEXT NOT NULL,
    "status" "AuthorizationRequestStatus" NOT NULL DEFAULT 'CREATED',
    "action" "AuthorizationRequestAction" NOT NULL,
    "hash" TEXT NOT NULL,
    "request" JSONB NOT NULL,
    "idempotency_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authorization_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authorization_request_approval" (
    "id" VARCHAR(255) NOT NULL,
    "signer_id" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "alg" TEXT NOT NULL DEFAULT 'ECDSA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authorization_request_approval_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "authorization_request_idempotency_key_key" ON "authorization_request"("idempotency_key");

-- AddForeignKey
ALTER TABLE "authorization_request" ADD CONSTRAINT "authorization_request_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
