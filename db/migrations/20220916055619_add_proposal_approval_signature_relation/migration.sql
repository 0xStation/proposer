/*
  Warnings:

  - The primary key for the `ProposalSignature` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `ProposalSignature` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateEnum
CREATE TYPE "ProposalNewApprovalStatus" AS ENUM ('INCOMPLETE', 'COMPLETE');

-- AlterTable
ALTER TABLE "ProposalNewApproval" ADD COLUMN     "status" "ProposalNewApprovalStatus" NOT NULL DEFAULT E'INCOMPLETE';

-- AlterTable
ALTER TABLE "ProposalSignature" DROP CONSTRAINT "ProposalSignature_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "ProposalSignature_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "_ApprovalSignature" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ApprovalSignature_AB_unique" ON "_ApprovalSignature"("A", "B");

-- CreateIndex
CREATE INDEX "_ApprovalSignature_B_index" ON "_ApprovalSignature"("B");

-- AddForeignKey
ALTER TABLE "_ApprovalSignature" ADD FOREIGN KEY ("A") REFERENCES "ProposalNewApproval"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApprovalSignature" ADD FOREIGN KEY ("B") REFERENCES "ProposalSignature"("id") ON DELETE CASCADE ON UPDATE CASCADE;
