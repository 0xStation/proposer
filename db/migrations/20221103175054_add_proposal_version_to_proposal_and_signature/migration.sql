-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "ProposalSignature" ADD COLUMN     "proposalVersion" INTEGER NOT NULL DEFAULT 1;
