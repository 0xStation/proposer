-- CreateEnum
CREATE TYPE "ProposalSignatureType" AS ENUM ('APPROVE', 'SEND');

-- AlterEnum
ALTER TYPE "ProposalRoleApprovalStatus" ADD VALUE 'SENT';

-- AlterTable
ALTER TABLE "ProposalSignature" ADD COLUMN     "type" "ProposalSignatureType" NOT NULL DEFAULT E'APPROVE';
