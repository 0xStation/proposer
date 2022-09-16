/*
  Warnings:

  - The primary key for the `ProposalSignature` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `ProposalSignature` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/

/*
DATA MIGRATION:
-- Delete all existing proposals
-- Cascades to delete all ProposalRole and ProposalSignature data
*/
DELETE FROM "ProposalNew";

-- CreateEnum
CREATE TYPE "ProposalNewApprovalStatus" AS ENUM ('INCOMPLETE', 'COMPLETE');

-- AlterTable
ALTER TABLE "ProposalSignature" DROP CONSTRAINT "ProposalSignature_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "ProposalSignature_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "ProposalNewApproval" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ProposalNewApprovalStatus" NOT NULL DEFAULT E'INCOMPLETE',
    "data" JSONB NOT NULL,

    CONSTRAINT "ProposalNewApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ApprovalSignature" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ProposalNewApproval_proposalId_address_key" ON "ProposalNewApproval"("proposalId", "address");

-- CreateIndex
CREATE UNIQUE INDEX "_ApprovalSignature_AB_unique" ON "_ApprovalSignature"("A", "B");

-- CreateIndex
CREATE INDEX "_ApprovalSignature_B_index" ON "_ApprovalSignature"("B");

-- AddForeignKey
ALTER TABLE "ProposalNewApproval" ADD CONSTRAINT "ProposalNewApproval_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "ProposalNew"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApprovalSignature" ADD FOREIGN KEY ("A") REFERENCES "ProposalNewApproval"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApprovalSignature" ADD FOREIGN KEY ("B") REFERENCES "ProposalSignature"("id") ON DELETE CASCADE ON UPDATE CASCADE;
