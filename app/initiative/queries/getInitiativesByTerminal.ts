import db from "db"
import * as z from "zod"
import { Initiative } from "../types"

const GetInitiativesByTerminal = z.object({
  terminalHandle: z.string(),
})

export default async function getInitiativesByTerminal(
  input: z.infer<typeof GetInitiativesByTerminal>
) {
  const data = GetInitiativesByTerminal.parse(input)
  const terminal = await db.terminal.findUnique({ where: { handle: data.terminalHandle } })

  // no terminal exist for that handle, so no initiatives can exist either
  if (!terminal) {
    return []
  }

  const initiatives = await db.initiative.findMany({
    where: { terminalId: terminal.id },
    include: {
      _count: {
        select: { applications: true },
      },
    },
  })

  if (!initiatives) {
    return []
  }

  return initiatives.map((i) => {
    return {
      ...i,
      applicationCount: i._count.applications,
    }
  }) as unknown as Initiative[]
}
