/*
  Warnings:

  - You are about to drop the column `role` on the `ProposalRole` table. All the data in the column will be lost.
  - Added the required column `type` to the `ProposalRole` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProposalRole" DROP COLUMN "role",
ADD COLUMN     "type" "ProposalRoleType" NOT NULL;
