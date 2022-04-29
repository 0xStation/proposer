-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT true,
    "terminalId" INTEGER NOT NULL,
    "data" JSONB,
    "accountTerminalAccountId" INTEGER,
    "accountTerminalTerminalId" INTEGER,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "Terminal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_accountTerminalAccountId_accountTerminalTerminalId_fkey" FOREIGN KEY ("accountTerminalAccountId", "accountTerminalTerminalId") REFERENCES "AccountTerminal"("accountId", "terminalId") ON DELETE SET NULL ON UPDATE CASCADE;
