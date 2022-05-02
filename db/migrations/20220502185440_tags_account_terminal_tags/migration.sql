-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "terminalId" INTEGER NOT NULL,
    "discordId" INTEGER,
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

-- CreateIndex
CREATE UNIQUE INDEX "Tag_value_terminalId_key" ON "Tag"("value", "terminalId");

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "Terminal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountTerminalTag" ADD CONSTRAINT "AccountTerminalTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountTerminalTag" ADD CONSTRAINT "AccountTerminalTag_ticketAccountId_ticketTerminalId_fkey" FOREIGN KEY ("ticketAccountId", "ticketTerminalId") REFERENCES "AccountTerminal"("accountId", "terminalId") ON DELETE RESTRICT ON UPDATE CASCADE;
