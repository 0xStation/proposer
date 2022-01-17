/*
  Warnings:

  - You are about to drop the `AccountSkills` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AccountSkills" DROP CONSTRAINT "AccountSkills_accountId_fkey";

-- DropForeignKey
ALTER TABLE "AccountSkills" DROP CONSTRAINT "AccountSkills_skillId_fkey";

-- DropTable
DROP TABLE "AccountSkills";

-- CreateTable
CREATE TABLE "SkillsOnAccounts" (
    "skillId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "SkillsOnAccounts_pkey" PRIMARY KEY ("skillId","accountId")
);

-- AddForeignKey
ALTER TABLE "SkillsOnAccounts" ADD CONSTRAINT "SkillsOnAccounts_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillsOnAccounts" ADD CONSTRAINT "SkillsOnAccounts_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
