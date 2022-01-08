-- DropForeignKey
ALTER TABLE "InitiativeApplication" DROP CONSTRAINT "InitiativeApplication_applicantId_fkey";

-- AlterTable
ALTER TABLE "InitiativeApplication" ALTER COLUMN "applicantId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "InitiativeApplication" ADD CONSTRAINT "InitiativeApplication_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
