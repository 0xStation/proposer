-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('WALLET', 'SAFE', 'CHECKBOOK');

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "type" "AccountType";

-- AddForeignKey
ALTER TABLE "ProposalRole" ADD CONSTRAINT "ProposalRole_address_fkey" FOREIGN KEY ("address") REFERENCES "Account"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
