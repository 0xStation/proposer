/*
  Warnings:

  - You are about to drop the column `type` on the `Proposal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Proposal" DROP COLUMN "type";

-- DropEnum
DROP TYPE "ProposalType";
