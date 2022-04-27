import db from "db"
import * as z from "zod"
import { Role } from "app/role/types"

const GetRoleByAccountTerminal = z.object({
  terminalId: z.number(),
  accountId: z.number(),
})

export default async function getRoleByAccountTerminal(
  input: z.infer<typeof GetRoleByAccountTerminal>
) {
  const data = GetRoleByAccountTerminal.parse(input)
  const { terminalId, accountId } = data

  const ticket = await db.membership.findUnique({
    where: {
      accountId_terminalId: {
        terminalId,
        accountId,
      },
    },
    include: { role: true },
  })

  if (!ticket) {
    return null
  }

  return ticket.role as Role
}
