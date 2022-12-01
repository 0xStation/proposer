-- CreateEnum
CREATE TYPE "ParticipantApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'SENT');

-- CreateTable
CREATE TABLE "ProposalParticipant" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "accountAddress" TEXT NOT NULL,
    "approvalStatus" "ParticipantApprovalStatus" NOT NULL DEFAULT E'PENDING',
    "data" JSONB NOT NULL,

    CONSTRAINT "ProposalParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ParticipantApprovalSignature" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ProposalParticipant_proposalId_accountAddress_key" ON "ProposalParticipant"("proposalId", "accountAddress");

-- CreateIndex
CREATE UNIQUE INDEX "_ParticipantApprovalSignature_AB_unique" ON "_ParticipantApprovalSignature"("A", "B");

-- CreateIndex
CREATE INDEX "_ParticipantApprovalSignature_B_index" ON "_ParticipantApprovalSignature"("B");

-- AddForeignKey
ALTER TABLE "ProposalParticipant" ADD CONSTRAINT "ProposalParticipant_accountAddress_fkey" FOREIGN KEY ("accountAddress") REFERENCES "Account"("address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalParticipant" ADD CONSTRAINT "ProposalParticipant_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParticipantApprovalSignature" ADD FOREIGN KEY ("A") REFERENCES "ProposalParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParticipantApprovalSignature" ADD FOREIGN KEY ("B") REFERENCES "ProposalSignature"("id") ON DELETE CASCADE ON UPDATE CASCADE;
