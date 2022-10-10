-- CreateEnum
CREATE TYPE "ProposalType" AS ENUM ('FUNDING', 'MESSAGE', 'CUSTOM');

-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "type" "ProposalType" NOT NULL DEFAULT E'FUNDING';
