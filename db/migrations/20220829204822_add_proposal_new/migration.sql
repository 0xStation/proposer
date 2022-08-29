-- CreateEnum
CREATE TYPE "ProposalRoleType" AS ENUM ('AUTHOR', 'CONTRIBUTOR', 'CLIENT');

-- CreateTable
CREATE TABLE "ProposalNew" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "ProposalNew_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalRole" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "role" "ProposalRoleType" NOT NULL,

    CONSTRAINT "ProposalRole_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProposalRole" ADD CONSTRAINT "ProposalRole_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "ProposalNew"("id") ON DELETE CASCADE ON UPDATE CASCADE;
