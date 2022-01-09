/*
  Warnings:

  - You are about to drop the column `terminalId` on the `Initiative` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[terminalTicket,localId]` on the table `Initiative` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `localId` to the `Initiative` table without a default value. This is not possible if the table is not empty.
  - Added the required column `terminalTicket` to the `Initiative` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Initiative" DROP CONSTRAINT "Initiative_terminalId_fkey";

-- AlterTable
ALTER TABLE "Initiative" DROP COLUMN "terminalId",
ADD COLUMN     "localId" INTEGER NOT NULL,
ADD COLUMN     "terminalTicket" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Initiative_terminalTicket_localId_key" ON "Initiative"("terminalTicket", "localId");

-- AddForeignKey
ALTER TABLE "Initiative" ADD CONSTRAINT "Initiative_terminalTicket_fkey" FOREIGN KEY ("terminalTicket") REFERENCES "Terminal"("ticketAddress") ON DELETE RESTRICT ON UPDATE CASCADE;
