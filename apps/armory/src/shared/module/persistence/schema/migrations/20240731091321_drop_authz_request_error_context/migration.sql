/*
  Warnings:

  - You are about to drop the column `context` on the `authorization_request_error` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "authorization_request_error" DROP COLUMN "context";
