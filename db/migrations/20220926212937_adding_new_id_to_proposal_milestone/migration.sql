/*
  Warnings:

  - The primary key for the `ProposalMilestone` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `milestoneIndex` on the `ProposalPayment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[proposalId,index]` on the table `ProposalMilestone` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `ProposalMilestone` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `milestoneId` to the `ProposalPayment` table without a default value. This is not possible if the table is not empty.

*/

/*
DATA MIGRATION:
-- Delete all existing proposals
-- Cascades to delete all ProposalRole and ProposalSignature data
*/
DELETE FROM "ProposalNew";

-- DropForeignKey
ALTER TABLE "ProposalPayment" DROP CONSTRAINT "ProposalPayment_proposalId_milestoneIndex_fkey";

-- AlterTable
ALTER TABLE "ProposalMilestone" DROP CONSTRAINT "ProposalMilestone_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "ProposalMilestone_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ProposalPayment" DROP COLUMN "milestoneIndex",
ADD COLUMN     "milestoneId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ProposalMilestone_proposalId_index_key" ON "ProposalMilestone"("proposalId", "index");

-- AddForeignKey
ALTER TABLE "ProposalPayment" ADD CONSTRAINT "ProposalPayment_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "ProposalMilestone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
