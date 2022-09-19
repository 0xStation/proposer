/*
  Warnings:

  - You are about to drop the `ProposalNewApproval` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ApprovalSignature` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ProposalRoleApprovalStatus" AS ENUM ('INCOMPLETE', 'COMPLETE');

-- DropForeignKey
ALTER TABLE "ProposalNewApproval" DROP CONSTRAINT "ProposalNewApproval_proposalId_fkey";

-- DropForeignKey
ALTER TABLE "_ApprovalSignature" DROP CONSTRAINT "_ApprovalSignature_A_fkey";

-- DropForeignKey
ALTER TABLE "_ApprovalSignature" DROP CONSTRAINT "_ApprovalSignature_B_fkey";

-- AlterTable
ALTER TABLE "ProposalRole" ADD COLUMN     "approvalStatus" "ProposalRoleApprovalStatus" NOT NULL DEFAULT E'INCOMPLETE';

-- DropTable
DROP TABLE "ProposalNewApproval";

-- DropTable
DROP TABLE "_ApprovalSignature";

-- DropEnum
DROP TYPE "ProposalNewApprovalStatus";

-- CreateTable
CREATE TABLE "_RoleApprovalSignature" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RoleApprovalSignature_AB_unique" ON "_RoleApprovalSignature"("A", "B");

-- CreateIndex
CREATE INDEX "_RoleApprovalSignature_B_index" ON "_RoleApprovalSignature"("B");

-- AddForeignKey
ALTER TABLE "_RoleApprovalSignature" ADD FOREIGN KEY ("A") REFERENCES "ProposalRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleApprovalSignature" ADD FOREIGN KEY ("B") REFERENCES "ProposalSignature"("id") ON DELETE CASCADE ON UPDATE CASCADE;
