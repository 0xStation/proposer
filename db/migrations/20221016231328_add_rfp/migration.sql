-- CreateEnum
CREATE TYPE "RfpStatus" AS ENUM ('OPEN', 'CLOSED');

-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "rfpId" TEXT;

-- CreateTable
CREATE TABLE "Rfp" (
    "id" TEXT NOT NULL,
    "accountAddress" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "RfpStatus" NOT NULL DEFAULT E'OPEN',

    CONSTRAINT "Rfp_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Rfp" ADD CONSTRAINT "Rfp_accountAddress_fkey" FOREIGN KEY ("accountAddress") REFERENCES "Account"("address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "Rfp"("id") ON DELETE CASCADE ON UPDATE CASCADE;
