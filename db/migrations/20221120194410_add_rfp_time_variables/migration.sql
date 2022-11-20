-- AlterEnum
ALTER TYPE "RfpStatus" ADD VALUE 'TIME_DEPENDENT';

-- AlterTable
ALTER TABLE "Rfp" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3);
