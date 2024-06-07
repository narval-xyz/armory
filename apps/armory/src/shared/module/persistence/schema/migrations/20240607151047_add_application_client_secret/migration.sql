-- AlterTable
ALTER TABLE "application" ADD COLUMN     "client_secret" TEXT;
UPDATE "application" SET client_secret = '******';
ALTER TABLE "application" SET COLUMN     "client_secret" TEXT NOT NULL;