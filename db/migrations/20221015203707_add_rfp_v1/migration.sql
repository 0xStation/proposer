-- CreateTable
CREATE TABLE "Rfp" (
    "id" TEXT NOT NULL,
    "accountAddress" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "Rfp_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Rfp" ADD CONSTRAINT "Rfp_accountAddress_fkey" FOREIGN KEY ("accountAddress") REFERENCES "Account"("address") ON DELETE CASCADE ON UPDATE CASCADE;
