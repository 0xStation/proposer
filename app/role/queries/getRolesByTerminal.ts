import db from "db"
import * as z from "zod"
import { Role } from "../types"

const GetRolesByTerminal = z.object({
  terminalHandle: z.string(),
})

export default async function getRolesByTerminal(input: z.infer<typeof GetRolesByTerminal>) {
  const data = GetRolesByTerminal.parse(input)
  const terminal = await db.terminal.findUnique({ where: { handle: data.terminalHandle } })

  // no terminal exist for that handle, so no initiatives can exist either
  if (!terminal) {
    return []
  }

  const roles = await db.role.findMany({
    where: { terminalId: terminal.id },
    include: {
      _count: {
        select: { tickets: true },
      },
    },
  })

  if (!roles) {
    return []
  }

  return roles.map((i) => {
    return {
      ...i,
      ticketCount: i._count.tickets,
    }
  }) as unknown as Role[]
}
