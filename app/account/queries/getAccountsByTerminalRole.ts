import db from "db"
import * as z from "zod"
import { Account, AccountMetadata } from "../types"
import { Role, RoleMetadata } from "app/role/types"

const GetAccountsByTerminalRole = z.object({
  terminalHandle: z.string(),
  roleLocalId: z.number(),
})

export default async function getAccountsByTerminalRole(
  input: z.infer<typeof GetAccountsByTerminalRole>
) {
  const data = GetAccountsByTerminalRole.parse(input)

  const terminal = await db.terminal.findUnique({ where: { handle: data.terminalHandle } })

  // no terminal exist for that handle, so no initiatives can exist either
  if (!terminal) {
    return []
  }

  const tickets = await db.accountTerminal.findMany({
    where: { terminalId: terminal.id, roleLocalId: data.roleLocalId },
    include: { account: true, role: true },
  })

  if (!tickets) {
    return null
  }

  const accounts = tickets.map((t) => {
    return {
      address: t.account.address,
      data: t.account.data as AccountMetadata,
      role: (t.role.data as RoleMetadata)?.value,
    }
  })

  return accounts as Account[]
}
