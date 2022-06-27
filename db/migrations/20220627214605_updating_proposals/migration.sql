/*
  Warnings:

  - Added the required column `terminalId` to the `Proposal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "terminalId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "Terminal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
