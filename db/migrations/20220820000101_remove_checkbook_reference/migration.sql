/*
  Warnings:

  - You are about to drop the column `fundingAddress` on the `Rfp` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Rfp" DROP CONSTRAINT "Rfp_fundingAddress_fkey";

-- AlterTable
ALTER TABLE "Rfp" DROP COLUMN "fundingAddress";
