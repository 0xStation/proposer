/*
  Warnings:

  - A unique constraint covering the columns `[terminalTicket,localId]` on the table `Initiative` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `terminalTicket` to the `Initiative` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Initiative" ADD COLUMN     "localId" SERIAL NOT NULL,
ADD COLUMN     "terminalTicket" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Initiative_terminalTicket_localId_key" ON "Initiative"("terminalTicket", "localId");
