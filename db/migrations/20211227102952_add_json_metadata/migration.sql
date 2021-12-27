/*
  Warnings:

  - You are about to drop the column `bio` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `handle` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `pronouns` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `initiativeApplicationId` on the `ApplicationEndorsement` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Initiative` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Initiative` table. All the data in the column will be lost.
  - You are about to drop the column `shortName` on the `Initiative` table. All the data in the column will be lost.
  - You are about to drop the column `approved` on the `InitiativeApplication` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `InitiativeApplication` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Terminal` table. All the data in the column will be lost.
  - You are about to drop the column `handle` on the `Terminal` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Terminal` table. All the data in the column will be lost.
  - You are about to drop the column `roleNameOverrides` on the `Terminal` table. All the data in the column will be lost.
  - You are about to drop the column `subgraphId` on the `Terminal` table. All the data in the column will be lost.
  - You are about to drop the column `ticketContract` on the `Terminal` table. All the data in the column will be lost.
  - You are about to drop the `Skill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ticket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AccountToSkill` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[address]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ticketAddress]` on the table `Terminal` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `applicationId` to the `ApplicationEndorsement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketAddress` to the `Terminal` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ApplicationEndorsement" DROP CONSTRAINT "ApplicationEndorsement_initiativeApplicationId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_terminalId_fkey";

-- DropForeignKey
ALTER TABLE "_AccountToSkill" DROP CONSTRAINT "_AccountToSkill_A_fkey";

-- DropForeignKey
ALTER TABLE "_AccountToSkill" DROP CONSTRAINT "_AccountToSkill_B_fkey";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "bio",
DROP COLUMN "handle",
DROP COLUMN "name",
DROP COLUMN "pronouns",
ADD COLUMN     "data" JSONB;

-- AlterTable
ALTER TABLE "ApplicationEndorsement" DROP COLUMN "initiativeApplicationId",
ADD COLUMN     "applicationId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Initiative" DROP COLUMN "description",
DROP COLUMN "name",
DROP COLUMN "shortName",
ADD COLUMN     "data" JSONB;

-- AlterTable
ALTER TABLE "InitiativeApplication" DROP COLUMN "approved",
DROP COLUMN "url",
ADD COLUMN     "data" JSONB;

-- AlterTable
ALTER TABLE "Terminal" DROP COLUMN "description",
DROP COLUMN "handle",
DROP COLUMN "name",
DROP COLUMN "roleNameOverrides",
DROP COLUMN "subgraphId",
DROP COLUMN "ticketContract",
ADD COLUMN     "data" JSONB,
ADD COLUMN     "ticketAddress" TEXT NOT NULL;

-- DropTable
DROP TABLE "Skill";

-- DropTable
DROP TABLE "Ticket";

-- DropTable
DROP TABLE "_AccountToSkill";

-- CreateIndex
CREATE UNIQUE INDEX "Account_address_key" ON "Account"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Terminal_ticketAddress_key" ON "Terminal"("ticketAddress");

-- AddForeignKey
ALTER TABLE "ApplicationEndorsement" ADD CONSTRAINT "ApplicationEndorsement_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "InitiativeApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
