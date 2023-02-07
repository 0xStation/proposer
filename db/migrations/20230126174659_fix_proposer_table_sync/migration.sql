-- DropForeignKey
ALTER TABLE "ProposalPayment" DROP CONSTRAINT "ProposalPayment_milestoneId_fkey";

-- AlterTable
ALTER TABLE "ProposalRole" ADD COLUMN     "data" JSONB;

-- AddForeignKey
ALTER TABLE "ProposalPayment" ADD CONSTRAINT "ProposalPayment_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "ProposalMilestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
