/*
  Warnings:

  - You are about to drop the column `bio` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `handle` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `pronouns` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Initiative` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Initiative` table. All the data in the column will be lost.
  - You are about to drop the column `shortName` on the `Initiative` table. All the data in the column will be lost.
  - You are about to drop the column `approved` on the `InitiativeApplication` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `InitiativeApplication` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Terminal` table. All the data in the column will be lost.
  - You are about to drop the column `handle` on the `Terminal` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Terminal` table. All the data in the column will be lost.
  - You are about to drop the column `roleNameOverrides` on the `Terminal` table. All the data in the column will be lost.
  - You are about to drop the `Skill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ticket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AccountToSkill` table. If the table is not empty, all the data it contains will be lost.

*/
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
ADD COLUMN     "data" JSONB;

-- DropTable
DROP TABLE "Skill";

-- DropTable
DROP TABLE "Ticket";

-- DropTable
DROP TABLE "_AccountToSkill";
