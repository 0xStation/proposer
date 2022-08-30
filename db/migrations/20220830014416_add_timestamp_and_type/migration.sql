/*
  Warnings:

  - Added the required column `type` to the `ProposalNew` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProposalType" AS ENUM ('FUNDING');

-- AlterTable
ALTER TABLE "ProposalNew" ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "type" "ProposalType" NOT NULL;
