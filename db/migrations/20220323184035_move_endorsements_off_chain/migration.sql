-- CreateTable
CREATE TABLE "Endorsement" (
    "id" SERIAL NOT NULL,
    "initiativeId" INTEGER NOT NULL,
    "endorserId" INTEGER NOT NULL,
    "endorseeId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" JSONB,

    CONSTRAINT "Endorsement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Endorsement" ADD CONSTRAINT "Endorsement_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "Initiative"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Endorsement" ADD CONSTRAINT "Endorsement_endorserId_fkey" FOREIGN KEY ("endorserId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Endorsement" ADD CONSTRAINT "Endorsement_endorseeId_fkey" FOREIGN KEY ("endorseeId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
