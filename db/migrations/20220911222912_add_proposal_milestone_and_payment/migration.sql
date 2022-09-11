-- CreateTable
CREATE TABLE "ProposalMilestone" (
    "proposalId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "ProposalMilestone_pkey" PRIMARY KEY ("proposalId","index")
);

-- CreateTable
CREATE TABLE "ProposalPayment" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "milestoneIndex" INTEGER NOT NULL,
    "senderAddress" TEXT NOT NULL,
    "recipientAddress" TEXT NOT NULL,
    "amount" DECIMAL(78,18),
    "tokenId" DECIMAL(78,0),
    "transactionHash" TEXT,
    "data" JSONB NOT NULL,

    CONSTRAINT "ProposalPayment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProposalMilestone" ADD CONSTRAINT "ProposalMilestone_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "ProposalNew"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalPayment" ADD CONSTRAINT "ProposalPayment_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "ProposalNew"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalPayment" ADD CONSTRAINT "ProposalPayment_proposalId_milestoneIndex_fkey" FOREIGN KEY ("proposalId", "milestoneIndex") REFERENCES "ProposalMilestone"("proposalId", "index") ON DELETE RESTRICT ON UPDATE CASCADE;
