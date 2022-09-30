-- CreateEnum
CREATE TYPE "ProposalSignatureType" AS ENUM ('APPROVE', 'SEND');

-- AlterTable
ALTER TABLE "ProposalSignature" ADD COLUMN     "type" "ProposalSignatureType" NOT NULL DEFAULT E'APPROVE';
