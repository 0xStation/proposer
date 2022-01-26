-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "data" JSONB,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Terminal" (
    "id" SERIAL NOT NULL,
    "ticketAddress" TEXT NOT NULL,
    "data" JSONB,

    CONSTRAINT "Terminal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Initiative" (
    "id" SERIAL NOT NULL,
    "terminalId" INTEGER NOT NULL,
    "terminalTicket" TEXT NOT NULL,
    "localId" SERIAL NOT NULL,
    "data" JSONB,

    CONSTRAINT "Initiative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InitiativeApplication" (
    "id" SERIAL NOT NULL,
    "applicantId" INTEGER NOT NULL,
    "initiativeId" INTEGER NOT NULL,
    "data" JSONB,

    CONSTRAINT "InitiativeApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillsOnAccounts" (
    "skillId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "SkillsOnAccounts_pkey" PRIMARY KEY ("skillId","accountId")
);

-- CreateTable
CREATE TABLE "ApplicationEndorsement" (
    "id" SERIAL NOT NULL,
    "signature" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "ApplicationEndorsement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_address_key" ON "Account"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Terminal_ticketAddress_key" ON "Terminal"("ticketAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Initiative_terminalTicket_localId_key" ON "Initiative"("terminalTicket", "localId");

-- AddForeignKey
ALTER TABLE "Initiative" ADD CONSTRAINT "Initiative_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "Terminal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InitiativeApplication" ADD CONSTRAINT "InitiativeApplication_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InitiativeApplication" ADD CONSTRAINT "InitiativeApplication_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "Initiative"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillsOnAccounts" ADD CONSTRAINT "SkillsOnAccounts_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillsOnAccounts" ADD CONSTRAINT "SkillsOnAccounts_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationEndorsement" ADD CONSTRAINT "ApplicationEndorsement_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "InitiativeApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationEndorsement" ADD CONSTRAINT "ApplicationEndorsement_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
