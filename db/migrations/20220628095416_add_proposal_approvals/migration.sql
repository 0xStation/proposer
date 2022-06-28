/*
  Warnings:

  - You are about to drop the column `terminalId` on the `Proposal` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Proposal" DROP CONSTRAINT "Proposal_terminalId_fkey";

-- AlterTable
ALTER TABLE "Proposal" DROP COLUMN "terminalId",
ALTER COLUMN "status" SET DEFAULT E'PUBLISHED';

-- CreateTable
CREATE TABLE "ProposalApproval" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "signerAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" JSONB NOT NULL,

    CONSTRAINT "ProposalApproval_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProposalApproval_proposalId_signerAddress_key" ON "ProposalApproval"("proposalId", "signerAddress");

-- AddForeignKey
ALTER TABLE "ProposalApproval" ADD CONSTRAINT "ProposalApproval_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalApproval" ADD CONSTRAINT "ProposalApproval_signerAddress_fkey" FOREIGN KEY ("signerAddress") REFERENCES "Account"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
