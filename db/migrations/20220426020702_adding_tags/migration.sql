/*
  Warnings:

  - You are about to drop the `AccountTerminal` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AccountTerminal" DROP CONSTRAINT "AccountTerminal_accountId_fkey";

-- DropForeignKey
ALTER TABLE "AccountTerminal" DROP CONSTRAINT "AccountTerminal_terminalId_fkey";

-- DropForeignKey
ALTER TABLE "AccountTerminal" DROP CONSTRAINT "AccountTerminal_terminalId_roleLocalId_fkey";

-- DropTable
DROP TABLE "AccountTerminal";

-- CreateTable
CREATE TABLE "Membership" (
    "accountId" INTEGER NOT NULL,
    "terminalId" INTEGER NOT NULL,
    "roleLocalId" INTEGER,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "data" JSONB,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("accountId","terminalId")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL,
    "terminalId" INTEGER NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipTag" (
    "tagId" INTEGER NOT NULL,
    "membershipAccountId" INTEGER NOT NULL,
    "membershipTerminalId" INTEGER NOT NULL,

    CONSTRAINT "MembershipTag_pkey" PRIMARY KEY ("tagId","membershipAccountId","membershipTerminalId")
);

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "Terminal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_terminalId_roleLocalId_fkey" FOREIGN KEY ("terminalId", "roleLocalId") REFERENCES "Role"("terminalId", "localId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "Terminal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipTag" ADD CONSTRAINT "MembershipTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipTag" ADD CONSTRAINT "MembershipTag_membershipAccountId_membershipTerminalId_fkey" FOREIGN KEY ("membershipAccountId", "membershipTerminalId") REFERENCES "Membership"("accountId", "terminalId") ON DELETE RESTRICT ON UPDATE CASCADE;
