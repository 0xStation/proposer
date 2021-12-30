import db from "db"
import * as z from "zod"

const GetInitiativeById = z.object({
  id: z.number(),
})

export default async function getInitiativeById(input: z.infer<typeof GetInitiativeById>) {
  const data = GetInitiativeById.parse(input)
  const initiative = await db.initiative.findFirst({ where: { id: data.id } })

  return initiative
}
