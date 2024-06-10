-- AlterTable
ALTER TABLE "client" ADD COLUMN     "client_secret" TEXT;
UPDATE "client" SET client_secret = '4afb3caf92873daa7dcf3f97cac7e39bf303cf8d6f4a4002f1a0620213e5a5c2';
ALTER TABLE "client" ALTER COLUMN   "client_secret" SET NOT NULL;
