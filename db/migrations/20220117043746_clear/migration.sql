/*
  Warnings:

  - Added the required column `accountSkillsAccountId` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountSkillsSkillId` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "accountSkillsAccountId" INTEGER NOT NULL,
ADD COLUMN     "accountSkillsSkillId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Skill" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountSkills" (
    "accountId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,

    CONSTRAINT "AccountSkills_pkey" PRIMARY KEY ("accountId","skillId")
);

-- AddForeignKey
ALTER TABLE "AccountSkills" ADD CONSTRAINT "AccountSkills_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountSkills" ADD CONSTRAINT "AccountSkills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
