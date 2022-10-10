-- CreateEnum
CREATE TYPE "ProposalTransactionStatus" AS ENUM ('PENDING', 'FAILURE', 'SUCCESS');

-- CreateTable
CREATE TABLE "ProposalTransaction" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "toAddress" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "data" JSONB NOT NULL,
    "status" "ProposalTransactionStatus" NOT NULL DEFAULT E'PENDING',
    "transactionHash" TEXT,

    CONSTRAINT "ProposalTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProposalTransactionExecutor" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProposalTransactionExecutor_AB_unique" ON "_ProposalTransactionExecutor"("A", "B");

-- CreateIndex
CREATE INDEX "_ProposalTransactionExecutor_B_index" ON "_ProposalTransactionExecutor"("B");

-- AddForeignKey
ALTER TABLE "ProposalTransaction" ADD CONSTRAINT "ProposalTransaction_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalTransaction" ADD CONSTRAINT "ProposalTransaction_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "ProposalMilestone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProposalTransactionExecutor" ADD FOREIGN KEY ("A") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProposalTransactionExecutor" ADD FOREIGN KEY ("B") REFERENCES "ProposalTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
