/*
  Warnings:

  - The primary key for the `ProposalSignature` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ProposalSignature` table. All the data in the column will be lost.
  - You are about to drop the `ProposalNewApproval` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ApprovalSignature` table. If the table is not empty, all the data it contains will be lost.

*/

/*
DATA MIGRATION:
-- Delete all existing proposals
-- Cascades to delete all ProposalRole and ProposalSignature data
*/
DELETE FROM "ProposalNew";

-- DropForeignKey
ALTER TABLE "ProposalNewApproval" DROP CONSTRAINT "ProposalNewApproval_proposalId_fkey";

-- DropForeignKey
ALTER TABLE "_ApprovalSignature" DROP CONSTRAINT "_ApprovalSignature_A_fkey";

-- DropForeignKey
ALTER TABLE "_ApprovalSignature" DROP CONSTRAINT "_ApprovalSignature_B_fkey";

-- AlterTable
ALTER TABLE "ProposalSignature" DROP CONSTRAINT "ProposalSignature_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "ProposalSignature_pkey" PRIMARY KEY ("proposalId", "address");

-- DropTable
DROP TABLE "ProposalNewApproval";

-- DropTable
DROP TABLE "_ApprovalSignature";

-- DropEnum
DROP TYPE "ProposalNewApprovalStatus";
