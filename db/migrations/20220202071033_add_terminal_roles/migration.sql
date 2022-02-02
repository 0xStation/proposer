/*
  Warnings:

  - You are about to drop the column `joinedAt` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Account` table. All the data in the column will be lost.
  - Added the required column `roleLocalId` to the `AccountTerminal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "joinedAt",
DROP COLUMN "role";

-- AlterTable
ALTER TABLE "AccountTerminal" ADD COLUMN     "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "roleLocalId" INTEGER NOT NULL,
ALTER COLUMN "ticketUrl" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Role" (
    "terminalId" INTEGER NOT NULL,
    "localId" SERIAL NOT NULL,
    "data" JSONB,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("terminalId","localId")
);

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "Terminal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountTerminal" ADD CONSTRAINT "AccountTerminal_terminalId_roleLocalId_fkey" FOREIGN KEY ("terminalId", "roleLocalId") REFERENCES "Role"("terminalId", "localId") ON DELETE RESTRICT ON UPDATE CASCADE;
