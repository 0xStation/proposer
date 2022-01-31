/*
  Warnings:

  - You are about to drop the `ApplicationEndorsement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ApplicationEndorsement" DROP CONSTRAINT "ApplicationEndorsement_accountId_fkey";

-- DropForeignKey
ALTER TABLE "ApplicationEndorsement" DROP CONSTRAINT "ApplicationEndorsement_applicationId_fkey";

-- DropTable
DROP TABLE "ApplicationEndorsement";
