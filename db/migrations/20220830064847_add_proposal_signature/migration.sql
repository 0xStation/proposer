-- CreateTable
CREATE TABLE "ProposalSignature" (
    "proposalId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" JSONB NOT NULL,

    CONSTRAINT "ProposalSignature_pkey" PRIMARY KEY ("proposalId","address")
);

-- AddForeignKey
ALTER TABLE "ProposalSignature" ADD CONSTRAINT "ProposalSignature_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "ProposalNew"("id") ON DELETE CASCADE ON UPDATE CASCADE;
