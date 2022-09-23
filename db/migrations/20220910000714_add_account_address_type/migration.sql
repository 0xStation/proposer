-- Delete all existing proposals data
-- Cascades to delete all ProposalRole and ProposalSignature data
DELETE FROM "ProposalNew";

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('WALLET', 'SAFE', 'CHECKBOOK');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "addressType" "AddressType";

-- AddForeignKey
ALTER TABLE "ProposalRole" ADD CONSTRAINT "ProposalRole_address_fkey" FOREIGN KEY ("address") REFERENCES "Account"("address") ON DELETE RESTRICT ON UPDATE CASCADE;