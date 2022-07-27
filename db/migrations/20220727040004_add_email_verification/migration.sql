-- CreateTable
CREATE TABLE "EmailVerification" (
    "accountId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "EmailVerification_pkey" PRIMARY KEY ("code")
);

-- AddForeignKey
ALTER TABLE "EmailVerification" ADD CONSTRAINT "EmailVerification_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
