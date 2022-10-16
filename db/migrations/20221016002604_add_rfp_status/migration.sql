-- CreateEnum
CREATE TYPE "RfpStatus" AS ENUM ('OPEN', 'CLOSED');

-- AlterTable
ALTER TABLE "Rfp" ADD COLUMN     "status" "RfpStatus" NOT NULL DEFAULT E'OPEN';
