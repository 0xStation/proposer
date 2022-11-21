-- AlterTable
ALTER TABLE "ProposalPayment" ADD COLUMN     "isError" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isRejected" BOOLEAN NOT NULL DEFAULT false;
