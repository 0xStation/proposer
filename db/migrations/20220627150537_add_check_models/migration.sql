-- CreateTable
CREATE TABLE "Check" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "fundingAddress" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "recipientAddress" TEXT NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "tokenAmount" DECIMAL(65,30) NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "nonce" INTEGER NOT NULL,
    "txnHash" TEXT,

    CONSTRAINT "Check_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckApproval" (
    "id" TEXT NOT NULL,
    "checkId" TEXT NOT NULL,
    "signerAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" JSONB NOT NULL,

    CONSTRAINT "CheckApproval_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Check_fundingAddress_nonce_key" ON "Check"("fundingAddress", "nonce");

-- CreateIndex
CREATE UNIQUE INDEX "CheckApproval_checkId_signerAddress_key" ON "CheckApproval"("checkId", "signerAddress");

-- AddForeignKey
ALTER TABLE "Check" ADD CONSTRAINT "Check_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Check" ADD CONSTRAINT "Check_fundingAddress_fkey" FOREIGN KEY ("fundingAddress") REFERENCES "Checkbook"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Check" ADD CONSTRAINT "Check_recipientAddress_fkey" FOREIGN KEY ("recipientAddress") REFERENCES "Account"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckApproval" ADD CONSTRAINT "CheckApproval_checkId_fkey" FOREIGN KEY ("checkId") REFERENCES "Check"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckApproval" ADD CONSTRAINT "CheckApproval_signerAddress_fkey" FOREIGN KEY ("signerAddress") REFERENCES "Account"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
