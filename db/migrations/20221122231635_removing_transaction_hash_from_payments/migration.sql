/*
  Warnings:

  - You are about to drop the column `transactionHash` on the `ProposalPayment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProposalPayment" DROP COLUMN "transactionHash";
