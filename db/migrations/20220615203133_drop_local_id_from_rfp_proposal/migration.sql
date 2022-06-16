/*
  Warnings:

  - You are about to drop the column `localId` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `localId` on the `Rfp` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Proposal_terminalId_localId_key";

-- DropIndex
DROP INDEX "Rfp_terminalId_localId_key";

-- AlterTable
ALTER TABLE "Proposal" DROP COLUMN "localId";

-- AlterTable
ALTER TABLE "Rfp" DROP COLUMN "localId";
