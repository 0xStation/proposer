/*
  Warnings:

  - You are about to drop the column `discordId` on the `Account` table. All the data in the column will be lost.
  - Made the column `address` on table `Account` required. This step will fail if there are existing NULL values in that column.
  - Made the column `data` on table `Account` required. This step will fail if there are existing NULL values in that column.
  - Made the column `addressType` on table `Account` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `Account` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Account` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "AccountAccount" DROP CONSTRAINT "AccountAccount_originAddress_fkey";

-- DropForeignKey
ALTER TABLE "AccountAccount" DROP CONSTRAINT "AccountAccount_targetAddress_fkey";

-- DropForeignKey
ALTER TABLE "ProposalRole" DROP CONSTRAINT "ProposalRole_address_fkey";

-- AddForeignKey
ALTER TABLE "AccountAccount" ADD CONSTRAINT "AccountAccount_originAddress_fkey" FOREIGN KEY ("originAddress") REFERENCES "Account"("address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountAccount" ADD CONSTRAINT "AccountAccount_targetAddress_fkey" FOREIGN KEY ("targetAddress") REFERENCES "Account"("address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalRole" ADD CONSTRAINT "ProposalRole_address_fkey" FOREIGN KEY ("address") REFERENCES "Account"("address") ON DELETE CASCADE ON UPDATE CASCADE;

/*
DATA MIGRATION:
-- Delete all existing accounts
-- Cascades to delete all AccountAccount, ProposalRole, Session, and AccountToken data
*/
DELETE FROM "Account";

-- DropIndex
DROP INDEX "Account_discordId_key";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "discordId",
ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "data" SET NOT NULL,
ALTER COLUMN "addressType" SET NOT NULL,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;