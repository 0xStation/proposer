-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT true,
    "terminalId" INTEGER NOT NULL,
    "data" JSONB,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountTerminalTag" (
    "tagId" INTEGER NOT NULL,
    "ticketAccountId" INTEGER NOT NULL,
    "ticketTerminalId" INTEGER NOT NULL,

    CONSTRAINT "AccountTerminalTag_pkey" PRIMARY KEY ("tagId","ticketAccountId","ticketTerminalId")
);

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "Terminal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountTerminalTag" ADD CONSTRAINT "AccountTerminalTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountTerminalTag" ADD CONSTRAINT "AccountTerminalTag_ticketAccountId_ticketTerminalId_fkey" FOREIGN KEY ("ticketAccountId", "ticketTerminalId") REFERENCES "AccountTerminal"("accountId", "terminalId") ON DELETE RESTRICT ON UPDATE CASCADE;
