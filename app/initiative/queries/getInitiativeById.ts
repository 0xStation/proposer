import db, { Initiative } from "db"
import * as z from "zod"
import { InitiativeMetadata } from "app/initiative/types"

const GetInitiativeById = z.object({
  id: z.number(),
})

export default async function getInitiativeById(input: z.infer<typeof GetInitiativeById>) {
  const data = GetInitiativeById.parse(input)
  const initiative = await db.initiative.findFirst({ where: { id: data.id } })

  if (!initiative) {
    return null
  }

  return {
    ...initiative,
    ...(initiative.data as Object),
  } as Initiative & InitiativeMetadata
}
