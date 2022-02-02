import db from "db"
import * as z from "zod"
import { Initiative } from "../types"

const GetInitiativeByLocalId = z.object({
  terminalTicket: z.string(),
  localId: z.number(),
})

export default async function getInitiativeByLocalId(
  input: z.infer<typeof GetInitiativeByLocalId>
) {
  const data = GetInitiativeByLocalId.parse(input)
  const initiative = await db.initiative.findUnique({
    where: { terminalInitiative: { terminalTicket: data.terminalTicket, localId: data.localId } },
    // include: {
    //   accounts: {
    //     include: account,
    //   },
    // },
  })

  if (!initiative) {
    return null
  }

  return initiative as Initiative
}
