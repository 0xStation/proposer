/*
DATA MIGRATION:
-- Delete all existing proposals
-- Cascades to delete all ProposalRole and ProposalSignature data
*/
DELETE FROM "ProposalNew";

-- AlterTable
ALTER TABLE "ProposalNew" ADD COLUMN     "currentMilestoneIndex" INTEGER NOT NULL DEFAULT -1;
