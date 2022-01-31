import db from "db"
import * as z from "zod"
import { Initiative } from "app/initiative/types"

const GetInitiativesByLocalIds = z.object({
  localIds: z.array(z.number()),
})

export default async function getInitiativesByLocalIds(
  input: z.infer<typeof GetInitiativesByLocalIds>
) {
  const data = GetInitiativesByLocalIds.parse(input)
  const initiatives = await db.initiative.findMany({ where: { localId: { in: data.localIds } } })

  if (!initiatives) {
    return []
  }

  return initiatives as Initiative[]
}
