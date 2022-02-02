import db from "db"
import * as z from "zod"
import { Role } from "../types"

const GetRolesByTerminal = z.object({
  terminalId: z.number(),
})

export default async function getRolesByTerminal(input: z.infer<typeof GetRolesByTerminal>) {
  const data = GetRolesByTerminal.parse(input)

  const roles = await db.role.findMany({
    where: { terminalId: data.terminalId },
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
