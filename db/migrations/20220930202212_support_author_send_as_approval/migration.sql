-- CreateEnum
CREATE TYPE "ProposalSignatureType" AS ENUM ('APPROVE', 'SEND');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProposalRoleApprovalStatus" ADD VALUE 'SENT';
ALTER TYPE "ProposalRoleApprovalStatus" ADD VALUE 'AWAITING_AUTHOR';

-- AlterTable
ALTER TABLE "ProposalSignature" ADD COLUMN     "type" "ProposalSignatureType" NOT NULL DEFAULT E'APPROVE';
