-- CreateEnum
CREATE TYPE "AccountAccountType" AS ENUM ('PIN_WORKSPACE');

-- CreateTable
CREATE TABLE "AccountAccount" (
    "id" TEXT NOT NULL,
    "originAddress" TEXT NOT NULL,
    "targetAddress" TEXT NOT NULL,
    "type" "AccountAccountType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "AccountAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountAccount_originAddress_targetAddress_type_key" ON "AccountAccount"("originAddress", "targetAddress", "type");

-- AddForeignKey
ALTER TABLE "AccountAccount" ADD CONSTRAINT "AccountAccount_originAddress_fkey" FOREIGN KEY ("originAddress") REFERENCES "Account"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountAccount" ADD CONSTRAINT "AccountAccount_targetAddress_fkey" FOREIGN KEY ("targetAddress") REFERENCES "Account"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
