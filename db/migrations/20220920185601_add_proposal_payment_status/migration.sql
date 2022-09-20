/*
  Warnings:

  - Added the required column `status` to the `ProposalPayment` table without a default value. This is not possible if the table is not empty.

*/

/*
DATA MIGRATION:
-- Delete all existing proposals
-- Cascades to delete all ProposalRole and ProposalSignature data
*/
DELETE FROM "ProposalNew";

-- CreateEnum
CREATE TYPE "ProposalPaymentStatus" AS ENUM ('SCHEDULED', 'PENDING', 'PAID');

-- AlterTable
ALTER TABLE "ProposalNew" ADD COLUMN     "currentMilestoneIndex" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ProposalPayment" ADD COLUMN     "status" "ProposalPaymentStatus" NOT NULL;
