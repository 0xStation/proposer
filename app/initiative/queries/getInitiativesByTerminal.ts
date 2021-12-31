import db from "db"
import * as z from "zod"
import { Initiative } from "../types"

const GetInitiativesByTerminal = z.object({
  terminalId: z.number(),
})

export default async function getInitiativesByTerminal(
  input: z.infer<typeof GetInitiativesByTerminal>
) {
  const data = GetInitiativesByTerminal.parse(input)
  const initiatives = await db.initiative.findMany({ where: { terminal: { id: data.terminalId } } })

  return initiatives as Initiative[]
}
