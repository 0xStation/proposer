/*
  Warnings:

  - A unique constraint covering the columns `[discordId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "discordId" TEXT,
ALTER COLUMN "address" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Account_discordId_key" ON "Account"("discordId");
