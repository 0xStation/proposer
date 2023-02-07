-- DropForeignKey
ALTER TABLE "Check" DROP CONSTRAINT "Check_chainId_address_fkey";

-- DropForeignKey
ALTER TABLE "Inbox" DROP CONSTRAINT "Inbox_chainId_address_fkey";

-- DropForeignKey
ALTER TABLE "Proof" DROP CONSTRAINT "Proof_checkId_fkey";

-- DropForeignKey
ALTER TABLE "Proof" DROP CONSTRAINT "Proof_checkSignatureId_fkey";

-- DropForeignKey
ALTER TABLE "ProposalPayment" DROP CONSTRAINT "ProposalPayment_milestoneId_fkey";

-- AlterTable
ALTER TABLE "ProposalRole" ADD COLUMN     "data" JSONB;

-- AddForeignKey
ALTER TABLE "Check" ADD CONSTRAINT "Check_chainId_address_fkey" FOREIGN KEY ("chainId", "address") REFERENCES "Checkbook"("chainId", "address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proof" ADD CONSTRAINT "Proof_checkId_fkey" FOREIGN KEY ("checkId") REFERENCES "Check"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proof" ADD CONSTRAINT "Proof_checkSignatureId_fkey" FOREIGN KEY ("checkSignatureId") REFERENCES "CheckSignature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inbox" ADD CONSTRAINT "Inbox_chainId_address_fkey" FOREIGN KEY ("chainId", "address") REFERENCES "Checkbook"("chainId", "address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalPayment" ADD CONSTRAINT "ProposalPayment_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "ProposalMilestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
