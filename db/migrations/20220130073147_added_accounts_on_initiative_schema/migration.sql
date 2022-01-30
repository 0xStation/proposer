-- CreateTable
CREATE TABLE "AccountsOnInitiative" (
    "accountId" INTEGER NOT NULL,
    "initiativeId" INTEGER NOT NULL,

    CONSTRAINT "AccountsOnInitiative_pkey" PRIMARY KEY ("accountId","initiativeId")
);

-- AddForeignKey
ALTER TABLE "AccountsOnInitiative" ADD CONSTRAINT "AccountsOnInitiative_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountsOnInitiative" ADD CONSTRAINT "AccountsOnInitiative_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "Initiative"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
