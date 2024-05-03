-- CreateTable
CREATE TABLE "engine" (
    "id" VARCHAR(255) NOT NULL,
    "org_id" TEXT NOT NULL,
    "client_secret" TEXT NOT NULL,
    "entity_key" JSONB NOT NULL,
    "policy_key" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "engine_pkey" PRIMARY KEY ("id")
);
