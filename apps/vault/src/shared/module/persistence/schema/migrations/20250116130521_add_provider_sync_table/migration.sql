-- CreateTable
CREATE TABLE "provider_scoped_sync" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error_name" TEXT,
    "error_message" TEXT,
    "error_trace_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "provider_scoped_sync_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "provider_scoped_sync" ADD CONSTRAINT "provider_scoped_sync_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "provider_connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
