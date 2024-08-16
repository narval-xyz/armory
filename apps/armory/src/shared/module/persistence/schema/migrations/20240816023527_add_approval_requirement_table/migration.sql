-- AlterTable
ALTER TABLE "evaluation_log" ADD COLUMN     "transaction_request_intent" JSONB;

-- CreateTable
CREATE TABLE "approval_requirement" (
    "id" VARCHAR(255) NOT NULL,
    "evaluation_id" TEXT NOT NULL,
    "approval_count" INTEGER NOT NULL,
    "approval_entity_type" TEXT NOT NULL,
    "entity_ids" TEXT[],
    "count_principal" BOOLEAN NOT NULL,
    "is_satisfied" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_requirement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "approval_requirement" ADD CONSTRAINT "approval_requirement_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "evaluation_log"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
