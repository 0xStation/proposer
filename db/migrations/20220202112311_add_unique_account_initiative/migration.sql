/*
  Warnings:

  - You are about to drop the `InitiativeApplication` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AccountInitiativeStatus" AS ENUM ('APPLIED', 'INVITED', 'CONTRIBUTOR', 'INACTIVE');

-- DropForeignKey
ALTER TABLE "InitiativeApplication" DROP CONSTRAINT "InitiativeApplication_applicantId_fkey";

-- DropForeignKey
ALTER TABLE "InitiativeApplication" DROP CONSTRAINT "InitiativeApplication_initiativeId_fkey";

-- DropTable
DROP TABLE "InitiativeApplication";

-- CreateTable
CREATE TABLE "AccountInitiative" (
    "id" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "initiativeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AccountInitiativeStatus" NOT NULL DEFAULT E'APPLIED',
    "data" JSONB,

    CONSTRAINT "AccountInitiative_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountInitiative_accountId_initiativeId_key" ON "AccountInitiative"("accountId", "initiativeId");

-- AddForeignKey
ALTER TABLE "AccountInitiative" ADD CONSTRAINT "AccountInitiative_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountInitiative" ADD CONSTRAINT "AccountInitiative_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "Initiative"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
