-- CreateTable
CREATE TABLE "ProposalNewApproval" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" JSONB NOT NULL,

    CONSTRAINT "ProposalNewApproval_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProposalNewApproval_proposalId_address_key" ON "ProposalNewApproval"("proposalId", "address");

-- AddForeignKey
ALTER TABLE "ProposalNewApproval" ADD CONSTRAINT "ProposalNewApproval_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "ProposalNew"("id") ON DELETE CASCADE ON UPDATE CASCADE;
