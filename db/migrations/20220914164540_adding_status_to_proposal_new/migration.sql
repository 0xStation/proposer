-- Delete all existing proposals
-- Cascades to delete all ProposalRole and ProposalSignature data
DELETE FROM "ProposalNew";

-- CreateEnum
CREATE TYPE "ProposalNewStatus" AS ENUM ('AWAITING_APPROVAL', 'DRAFT', 'APPROVED', 'COMPLETE');

-- AlterTable
ALTER TABLE "ProposalNew" ADD COLUMN     "status" "ProposalNewStatus" NOT NULL DEFAULT E'DRAFT';
