-- CreateTable
CREATE TABLE "AccountTerminal" (
    "accountId" INTEGER NOT NULL,
    "terminalId" INTEGER NOT NULL,
    "ticketUrl" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,

    CONSTRAINT "AccountTerminal_pkey" PRIMARY KEY ("accountId","terminalId")
);

-- AddForeignKey
ALTER TABLE "AccountTerminal" ADD CONSTRAINT "AccountTerminal_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountTerminal" ADD CONSTRAINT "AccountTerminal_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "Terminal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
