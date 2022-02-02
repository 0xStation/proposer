import db from "db"
import * as z from "zod"
import { Initiative, InitiativeMetadata } from "../types"
import { Role } from "app/role/types"

const GetInitiativesByContributor = z.object({
  accountId: z.number(),
  terminalId: z.number(),
})

export default async function getInitiativesByContributor(
  input: z.infer<typeof GetInitiativesByContributor>
) {
  const data = GetInitiativesByContributor.parse(input)

  const accountInitiatives = await db.accountInitiative.findMany({
    where: { accountId: data.accountId, status: "CONTRIBUTOR" },
    include: {
      initiative: true,
    },
  })

  if (!accountInitiatives) {
    return []
  }

  const initiatives = accountInitiatives
    .filter((ai) => ai.initiative.terminalId == data.terminalId)
    .map((ai) => {
      return {
        ...ai.initiative,
      }
    })

  return initiatives as unknown as Initiative[]
}
