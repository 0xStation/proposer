import db, { Initiative } from "db"
import * as z from "zod"
import { InitiativeMetadata } from "app/initiative/types"

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
  })

  if (!initiative) {
    return null
  }

  return {
    ...initiative,
    ...(initiative.data as Object),
  } as Initiative & InitiativeMetadata
}
