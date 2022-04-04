/*
  Warnings:

  - The values [APPLIED,INVITED,CONTRIBUTOR,INACTIVE] on the enum `AccountInitiativeStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AccountInitiativeStatus_new" AS ENUM ('INTERESTED', 'CONTRIBUTING', 'PREVIOUS_CONTRIBUTOR');
ALTER TABLE "AccountInitiative" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "AccountInitiative" ALTER COLUMN "status" TYPE "AccountInitiativeStatus_new" USING ("status"::text::"AccountInitiativeStatus_new");
ALTER TYPE "AccountInitiativeStatus" RENAME TO "AccountInitiativeStatus_old";
ALTER TYPE "AccountInitiativeStatus_new" RENAME TO "AccountInitiativeStatus";
DROP TYPE "AccountInitiativeStatus_old";
ALTER TABLE "AccountInitiative" ALTER COLUMN "status" SET DEFAULT 'INTERESTED';
COMMIT;

-- AlterTable
ALTER TABLE "AccountInitiative" ALTER COLUMN "status" SET DEFAULT E'INTERESTED';
