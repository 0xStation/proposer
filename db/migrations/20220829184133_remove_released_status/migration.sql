/*
  Warnings:

  - The values [RELEASED] on the enum `FeatureFlagStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FeatureFlagStatus_new" AS ENUM ('OFF', 'ON');
ALTER TABLE "FeatureFlag" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "FeatureFlag" ALTER COLUMN "status" TYPE "FeatureFlagStatus_new" USING ("status"::text::"FeatureFlagStatus_new");
ALTER TYPE "FeatureFlagStatus" RENAME TO "FeatureFlagStatus_old";
ALTER TYPE "FeatureFlagStatus_new" RENAME TO "FeatureFlagStatus";
DROP TYPE "FeatureFlagStatus_old";
ALTER TABLE "FeatureFlag" ALTER COLUMN "status" SET DEFAULT 'OFF';
COMMIT;
