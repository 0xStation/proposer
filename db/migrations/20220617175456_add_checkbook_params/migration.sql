/*
  Warnings:

  - Added the required column `quorum` to the `Checkbook` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Checkbook" 
ADD COLUMN     "quorum" INTEGER NOT NULL,
ADD COLUMN     "signers" TEXT[];
