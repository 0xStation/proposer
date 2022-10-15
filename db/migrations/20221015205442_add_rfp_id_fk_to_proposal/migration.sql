/*
  Warnings:

  - Added the required column `updatedAt` to the `Rfp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "rfpId" TEXT;

-- AlterTable
ALTER TABLE "Rfp" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "Rfp"("id") ON DELETE CASCADE ON UPDATE CASCADE;
