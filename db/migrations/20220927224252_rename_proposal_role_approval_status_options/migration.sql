/*
  Warnings:

  - The values [CHECKBOOK] on the enum `AddressType` will be removed. If these variants are still used in the database, this will fail.
  - The values [INCOMPLETE,COMPLETE] on the enum `ProposalRoleApprovalStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AddressType_new" AS ENUM ('WALLET', 'SAFE');
ALTER TABLE "Account" ALTER COLUMN "addressType" TYPE "AddressType_new" USING ("addressType"::text::"AddressType_new");
ALTER TYPE "AddressType" RENAME TO "AddressType_old";
ALTER TYPE "AddressType_new" RENAME TO "AddressType";
DROP TYPE "AddressType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ProposalRoleApprovalStatus_new" AS ENUM ('PENDING', 'APPROVED');
ALTER TABLE "ProposalRole" ALTER COLUMN "approvalStatus" DROP DEFAULT;
ALTER TABLE "ProposalRole" ALTER COLUMN "approvalStatus" TYPE "ProposalRoleApprovalStatus_new" USING ("approvalStatus"::text::"ProposalRoleApprovalStatus_new");
ALTER TYPE "ProposalRoleApprovalStatus" RENAME TO "ProposalRoleApprovalStatus_old";
ALTER TYPE "ProposalRoleApprovalStatus_new" RENAME TO "ProposalRoleApprovalStatus";
DROP TYPE "ProposalRoleApprovalStatus_old";
ALTER TABLE "ProposalRole" ALTER COLUMN "approvalStatus" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "ProposalRole" ALTER COLUMN "approvalStatus" SET DEFAULT E'PENDING';
