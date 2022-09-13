-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- Add default values
UPDATE "Account" SET "createdAt" = CURRENT_TIMESTAMP;
UPDATE "Account" SET "updatedAt" = CURRENT_TIMESTAMP;