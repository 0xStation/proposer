/*
  Warnings:

  - You are about to drop the column `fundingAddress` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `terminalId` on the `Proposal` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Proposal" DROP CONSTRAINT "Proposal_terminalId_fkey";

-- AlterTable
ALTER TABLE "Proposal" DROP COLUMN "fundingAddress",
DROP COLUMN "terminalId";
