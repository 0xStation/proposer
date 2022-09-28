/*
  Warnings:

  - You are about to drop the `ProposalNew` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProposalMilestone" DROP CONSTRAINT "ProposalMilestone_proposalId_fkey";

-- DropForeignKey
ALTER TABLE "ProposalPayment" DROP CONSTRAINT "ProposalPayment_proposalId_fkey";

-- DropForeignKey
ALTER TABLE "ProposalRole" DROP CONSTRAINT "ProposalRole_proposalId_fkey";

-- DropForeignKey
ALTER TABLE "ProposalSignature" DROP CONSTRAINT "ProposalSignature_proposalId_fkey";

-- DropTable
DROP TABLE "ProposalNew";

-- DropEnum
DROP TYPE "RfpStatus";

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "type" "ProposalType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentMilestoneIndex" INTEGER NOT NULL DEFAULT -1,
    "data" JSONB NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT E'DRAFT',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProposalSignature" ADD CONSTRAINT "ProposalSignature_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalRole" ADD CONSTRAINT "ProposalRole_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalMilestone" ADD CONSTRAINT "ProposalMilestone_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalPayment" ADD CONSTRAINT "ProposalPayment_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
