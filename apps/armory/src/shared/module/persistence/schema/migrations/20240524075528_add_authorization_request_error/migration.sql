-- CreateTable
CREATE TABLE "authorization_request_error" (
    "id" VARCHAR(255) NOT NULL,
    "client_id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "context" JSONB,

    CONSTRAINT "authorization_request_error_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "authorization_request_error" ADD CONSTRAINT "authorization_request_error_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "authorization_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
