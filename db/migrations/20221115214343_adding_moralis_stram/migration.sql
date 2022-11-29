/*
  Warnings:

  - A unique constraint covering the columns `[moralisStreamId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "moralisStreamId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Account_moralisStreamId_key" ON "Account"("moralisStreamId");
