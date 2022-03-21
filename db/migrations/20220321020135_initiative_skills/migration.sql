-- CreateTable
CREATE TABLE "InitiativeSkill" (
    "initiativeId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,

    CONSTRAINT "InitiativeSkill_pkey" PRIMARY KEY ("initiativeId","skillId")
);

-- AddForeignKey
ALTER TABLE "InitiativeSkill" ADD CONSTRAINT "InitiativeSkill_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "Initiative"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InitiativeSkill" ADD CONSTRAINT "InitiativeSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
