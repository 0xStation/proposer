/*
  Warnings:

  - You are about to drop the column `data` on the `ProposalRole` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProposalPayment" DROP CONSTRAINT "ProposalPayment_milestoneId_fkey";

-- AlterTable
ALTER TABLE "ProposalRole" DROP COLUMN "data";

-- CreateTable
CREATE TABLE "Checkbook" (
    "chainId" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "Checkbook_pkey" PRIMARY KEY ("chainId","address")
);

-- CreateTable
CREATE TABLE "Check" (
    "id" TEXT NOT NULL,
    "nonce" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "data" JSONB NOT NULL,
    "chainId" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "txnHash" TEXT,
    "inboxId" TEXT,

    CONSTRAINT "Check_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckSignature" (
    "id" TEXT NOT NULL,
    "signer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "root" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "CheckSignature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proof" (
    "id" TEXT NOT NULL,
    "checkSignatureId" TEXT NOT NULL,
    "checkId" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "Proof_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inbox" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "data" JSONB NOT NULL,
    "chainId" INTEGER NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "Inbox_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Check" ADD CONSTRAINT "Check_chainId_address_fkey" FOREIGN KEY ("chainId", "address") REFERENCES "Checkbook"("chainId", "address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Check" ADD CONSTRAINT "Check_inboxId_fkey" FOREIGN KEY ("inboxId") REFERENCES "Inbox"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proof" ADD CONSTRAINT "Proof_checkId_fkey" FOREIGN KEY ("checkId") REFERENCES "Check"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proof" ADD CONSTRAINT "Proof_checkSignatureId_fkey" FOREIGN KEY ("checkSignatureId") REFERENCES "CheckSignature"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inbox" ADD CONSTRAINT "Inbox_chainId_address_fkey" FOREIGN KEY ("chainId", "address") REFERENCES "Checkbook"("chainId", "address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalPayment" ADD CONSTRAINT "ProposalPayment_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "ProposalMilestone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
