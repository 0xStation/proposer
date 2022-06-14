-- CreateEnum
CREATE TYPE "RfpStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('IN_REVIEW', 'APPROVED');

-- CreateTable
CREATE TABLE "Checkbook" (
    "address" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "terminalId" INTEGER NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "Checkbook_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "Rfp" (
    "id" TEXT NOT NULL,
    "terminalId" INTEGER NOT NULL,
    "localId" INTEGER NOT NULL,
    "fundingAddress" TEXT NOT NULL,
    "authorAddress" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "RfpStatus" NOT NULL DEFAULT E'DRAFT',
    "data" JSONB NOT NULL,

    CONSTRAINT "Rfp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "terminalId" INTEGER NOT NULL,
    "fundingAddress" TEXT NOT NULL,
    "rfpId" TEXT NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT E'IN_REVIEW',
    "data" JSONB NOT NULL,
    "localId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountProposal" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "terminalId" INTEGER NOT NULL,
    "proposalId" TEXT NOT NULL,

    CONSTRAINT "AccountProposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rfp_terminalId_localId_key" ON "Rfp"("terminalId", "localId");

-- CreateIndex
CREATE UNIQUE INDEX "Proposal_terminalId_localId_key" ON "Proposal"("terminalId", "localId");

-- AddForeignKey
ALTER TABLE "Checkbook" ADD CONSTRAINT "Checkbook_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "Terminal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rfp" ADD CONSTRAINT "Rfp_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "Terminal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rfp" ADD CONSTRAINT "Rfp_fundingAddress_fkey" FOREIGN KEY ("fundingAddress") REFERENCES "Checkbook"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rfp" ADD CONSTRAINT "Rfp_authorAddress_fkey" FOREIGN KEY ("authorAddress") REFERENCES "Account"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "Terminal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_rfpId_fkey" FOREIGN KEY ("rfpId") REFERENCES "Rfp"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountProposal" ADD CONSTRAINT "AccountProposal_address_fkey" FOREIGN KEY ("address") REFERENCES "Account"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountProposal" ADD CONSTRAINT "AccountProposal_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "Terminal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountProposal" ADD CONSTRAINT "AccountProposal_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
