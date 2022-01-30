/*
  Warnings:

  - You are about to drop the `AccountsOnInitiative` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AccountsOnInitiative" DROP CONSTRAINT "AccountsOnInitiative_accountId_fkey";

-- DropForeignKey
ALTER TABLE "AccountsOnInitiative" DROP CONSTRAINT "AccountsOnInitiative_initiativeId_fkey";

-- DropTable
DROP TABLE "AccountsOnInitiative";
