/*
  Warnings:

  - The values [IN_REVIEW,APPROVED] on the enum `ProposalStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [ARCHIVED] on the enum `RfpStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProposalStatus_new" AS ENUM ('DRAFT', 'PUBLISHED');
ALTER TABLE "Proposal" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Proposal" ALTER COLUMN "status" TYPE "ProposalStatus_new" USING ("status"::text::"ProposalStatus_new");
ALTER TYPE "ProposalStatus" RENAME TO "ProposalStatus_old";
ALTER TYPE "ProposalStatus_new" RENAME TO "ProposalStatus";
DROP TYPE "ProposalStatus_old";
ALTER TABLE "Proposal" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RfpStatus_new" AS ENUM ('DRAFT', 'PUBLISHED', 'DELETED');
ALTER TABLE "Rfp" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Rfp" ALTER COLUMN "status" TYPE "RfpStatus_new" USING ("status"::text::"RfpStatus_new");
ALTER TYPE "RfpStatus" RENAME TO "RfpStatus_old";
ALTER TYPE "RfpStatus_new" RENAME TO "RfpStatus";
DROP TYPE "RfpStatus_old";
ALTER TABLE "Rfp" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "Proposal" ALTER COLUMN "status" SET DEFAULT E'DRAFT';
