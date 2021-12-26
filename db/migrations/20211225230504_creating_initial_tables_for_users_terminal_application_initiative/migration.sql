-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "pronouns" TEXT NOT NULL,
    "bio" TEXT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Terminal" (
    "id" SERIAL NOT NULL,
    "subgraphId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ticketContract" TEXT NOT NULL,
    "roleNameOverrides" JSONB,

    CONSTRAINT "Terminal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "accountId" INTEGER NOT NULL,
    "terminalId" INTEGER NOT NULL,
    "signiture" TEXT NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("accountId","terminalId")
);

-- CreateTable
CREATE TABLE "Initiative" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "terminalId" INTEGER NOT NULL,

    CONSTRAINT "Initiative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InitiativeApplication" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL,
    "applicantId" INTEGER NOT NULL,
    "initiativeId" INTEGER NOT NULL,

    CONSTRAINT "InitiativeApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationEndorsement" (
    "id" SERIAL NOT NULL,
    "signature" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "initiativeApplicationId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "ApplicationEndorsement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AccountToSkill" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AccountToSkill_AB_unique" ON "_AccountToSkill"("A", "B");

-- CreateIndex
CREATE INDEX "_AccountToSkill_B_index" ON "_AccountToSkill"("B");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "Terminal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Initiative" ADD CONSTRAINT "Initiative_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "Terminal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InitiativeApplication" ADD CONSTRAINT "InitiativeApplication_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InitiativeApplication" ADD CONSTRAINT "InitiativeApplication_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "Initiative"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationEndorsement" ADD CONSTRAINT "ApplicationEndorsement_initiativeApplicationId_fkey" FOREIGN KEY ("initiativeApplicationId") REFERENCES "InitiativeApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationEndorsement" ADD CONSTRAINT "ApplicationEndorsement_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountToSkill" ADD FOREIGN KEY ("A") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccountToSkill" ADD FOREIGN KEY ("B") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
