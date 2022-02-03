/*
  Warnings:

  - The primary key for the `AccountInitiative` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `AccountInitiative` table. All the data in the column will be lost.
  - You are about to drop the column `ticketUrl` on the `AccountTerminal` table. All the data in the column will be lost.
  - You are about to drop the column `terminalTicket` on the `Initiative` table. All the data in the column will be lost.
  - You are about to drop the `SkillsOnAccounts` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[terminalId,localId]` on the table `Initiative` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "SkillsOnAccounts" DROP CONSTRAINT "SkillsOnAccounts_accountId_fkey";

-- DropForeignKey
ALTER TABLE "SkillsOnAccounts" DROP CONSTRAINT "SkillsOnAccounts_skillId_fkey";

-- DropIndex
DROP INDEX "AccountInitiative_accountId_initiativeId_key";

-- DropIndex
DROP INDEX "Initiative_terminalTicket_localId_key";

-- AlterTable
ALTER TABLE "AccountInitiative" DROP CONSTRAINT "AccountInitiative_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "AccountInitiative_pkey" PRIMARY KEY ("accountId", "initiativeId");

-- AlterTable
ALTER TABLE "AccountTerminal" DROP COLUMN "ticketUrl",
ADD COLUMN     "data" JSONB;

-- AlterTable
ALTER TABLE "Initiative" DROP COLUMN "terminalTicket";

-- DropTable
DROP TABLE "SkillsOnAccounts";

-- CreateTable
CREATE TABLE "AccountSkill" (
    "accountId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,

    CONSTRAINT "AccountSkill_pkey" PRIMARY KEY ("accountId","skillId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Initiative_terminalId_localId_key" ON "Initiative"("terminalId", "localId");

-- AddForeignKey
ALTER TABLE "AccountSkill" ADD CONSTRAINT "AccountSkill_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountSkill" ADD CONSTRAINT "AccountSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
