-- DropForeignKey
ALTER TABLE "AccountInitiative" DROP CONSTRAINT "AccountInitiative_accountId_fkey";

-- DropForeignKey
ALTER TABLE "AccountSkill" DROP CONSTRAINT "AccountSkill_accountId_fkey";

-- DropForeignKey
ALTER TABLE "AccountTerminal" DROP CONSTRAINT "AccountTerminal_accountId_fkey";

-- DropForeignKey
ALTER TABLE "AccountTerminalTag" DROP CONSTRAINT "AccountTerminalTag_ticketAccountId_ticketTerminalId_fkey";

-- DropForeignKey
ALTER TABLE "Endorsement" DROP CONSTRAINT "Endorsement_endorserId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- AddForeignKey
ALTER TABLE "AccountTerminal" ADD CONSTRAINT "AccountTerminal_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountInitiative" ADD CONSTRAINT "AccountInitiative_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountSkill" ADD CONSTRAINT "AccountSkill_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Endorsement" ADD CONSTRAINT "Endorsement_endorserId_fkey" FOREIGN KEY ("endorserId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountTerminalTag" ADD CONSTRAINT "AccountTerminalTag_ticketAccountId_ticketTerminalId_fkey" FOREIGN KEY ("ticketAccountId", "ticketTerminalId") REFERENCES "AccountTerminal"("accountId", "terminalId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
