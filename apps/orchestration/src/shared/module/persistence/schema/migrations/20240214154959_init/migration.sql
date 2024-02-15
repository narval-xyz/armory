-- CreateEnum
CREATE TYPE "AuthorizationRequestStatus" AS ENUM ('CREATED', 'FAILED', 'CANCELED', 'PROCESSING', 'APPROVING', 'PERMITTED', 'FORBIDDEN');

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
    "action" TEXT NOT NULL,
    "request" JSONB NOT NULL,
    "idempotency_key" TEXT,
    "authn_alg" TEXT NOT NULL,
    "authn_pub_key" TEXT NOT NULL,
    "authn_sig" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authorization_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authorization_request_approval" (
    "id" VARCHAR(255) NOT NULL,
    "request_id" TEXT NOT NULL,
    "alg" TEXT NOT NULL,
    "pub_key" TEXT NOT NULL,
    "sig" TEXT NOT NULL,
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
CREATE TABLE "approved_transfer" (
    "id" VARCHAR(255) NOT NULL,
    "org_id" TEXT NOT NULL,
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
    "org_id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sig" TEXT,
    "alg" TEXT,
    "pubKey" TEXT,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_entity" (
    "uid" TEXT NOT NULL,

    CONSTRAINT "organization_entity_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "auth_credential_entity" (
    "org_id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "pub_key" TEXT NOT NULL,
    "alg" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "auth_credential_entity_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "user_entity" (
    "org_id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "user_entity_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "user_group_entity" (
    "org_id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,

    CONSTRAINT "user_group_entity_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "user_group_member_entity" (
    "user_uid" TEXT NOT NULL,
    "user_group_uid" TEXT NOT NULL,

    CONSTRAINT "user_group_member_entity_pkey" PRIMARY KEY ("user_uid","user_group_uid")
);

-- CreateTable
CREATE TABLE "wallet_entity" (
    "org_id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "account_type" TEXT NOT NULL,
    "chain_id" INTEGER,

    CONSTRAINT "wallet_entity_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "wallet_group_entity" (
    "org_id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,

    CONSTRAINT "wallet_group_entity_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "wallet_group_member_entity" (
    "wallet_uid" TEXT NOT NULL,
    "wallet_group_uid" TEXT NOT NULL,

    CONSTRAINT "wallet_group_member_entity_pkey" PRIMARY KEY ("wallet_uid","wallet_group_uid")
);

-- CreateTable
CREATE TABLE "user_wallet_entity" (
    "org_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,

    CONSTRAINT "user_wallet_entity_pkey" PRIMARY KEY ("user_id","wallet_id")
);

-- CreateTable
CREATE TABLE "address_book_account_entity" (
    "org_id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "classification" TEXT NOT NULL,

    CONSTRAINT "address_book_account_entity_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "token_entity" (
    "org_id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "decimals" INTEGER NOT NULL,

    CONSTRAINT "token_entity_pkey" PRIMARY KEY ("uid")
);

-- CreateIndex
CREATE UNIQUE INDEX "authorization_request_idempotency_key_key" ON "authorization_request"("idempotency_key");

-- AddForeignKey
ALTER TABLE "authorization_request_approval" ADD CONSTRAINT "authorization_request_approval_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "authorization_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_log" ADD CONSTRAINT "evaluation_log_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "authorization_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_group_member_entity" ADD CONSTRAINT "user_group_member_entity_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "user_entity"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_group_member_entity" ADD CONSTRAINT "user_group_member_entity_user_group_uid_fkey" FOREIGN KEY ("user_group_uid") REFERENCES "user_group_entity"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_group_member_entity" ADD CONSTRAINT "wallet_group_member_entity_wallet_uid_fkey" FOREIGN KEY ("wallet_uid") REFERENCES "wallet_entity"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_group_member_entity" ADD CONSTRAINT "wallet_group_member_entity_wallet_group_uid_fkey" FOREIGN KEY ("wallet_group_uid") REFERENCES "wallet_group_entity"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_wallet_entity" ADD CONSTRAINT "user_wallet_entity_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallet_entity"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_wallet_entity" ADD CONSTRAINT "user_wallet_entity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_entity"("uid") ON DELETE CASCADE ON UPDATE CASCADE;
