/*
  Warnings:

  - The values [ARCHIVED] on the enum `RfpStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RfpStatus_new" AS ENUM ('DRAFT', 'PUBLISHED', 'DELETED');
ALTER TABLE "Rfp" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Rfp" ALTER COLUMN "status" TYPE "RfpStatus_new" USING ("status"::text::"RfpStatus_new");
ALTER TYPE "RfpStatus" RENAME TO "RfpStatus_old";
ALTER TYPE "RfpStatus_new" RENAME TO "RfpStatus";
DROP TYPE "RfpStatus_old";
ALTER TABLE "Rfp" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;
