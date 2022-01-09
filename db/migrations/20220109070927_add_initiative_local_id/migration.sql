/*
  Warnings:

  - A unique constraint covering the columns `[terminalId,localId]` on the table `Initiative` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `localId` to the `Initiative` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Initiative" ADD COLUMN     "localId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Initiative_terminalId_localId_key" ON "Initiative"("terminalId", "localId");
