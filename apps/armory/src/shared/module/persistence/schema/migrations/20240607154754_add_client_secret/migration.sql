-- AlterTable
-- We first add a nullable column, then we update it with a value, and finally we set it to NOT NULL
-- This is done to avoid a lock on the table while updating the column
ALTER TABLE "client" ADD COLUMN     "client_secret" TEXT;
UPDATE "client" SET client_secret = '4afb3caf92873daa7dcf3f97cac7e39bf303cf8d6f4a4002f1a0620213e5a5c2';
ALTER TABLE "client" ALTER COLUMN   "client_secret" SET NOT NULL;
