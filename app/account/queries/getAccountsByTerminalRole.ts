import db from "db"
import * as z from "zod"
import { Account, AccountMetadata } from "../types"
import { Role, RoleMetadata } from "app/role/types"

const GetAccountsByTerminalRole = z.object({
  terminalId: z.number(),
  roleLocalId: z.number(),
})

export default async function getAccountsByTerminalRole(
  input: z.infer<typeof GetAccountsByTerminalRole>
) {
  const data = GetAccountsByTerminalRole.parse(input)

  const tickets = await db.accountTerminal.findMany({
    where: { terminalId: data.terminalId, roleLocalId: data.roleLocalId },
    include: {
      account: {
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
        },
      },
      role: true,
    },
  })

  if (!tickets) {
    return null
  }

  const accounts = tickets.map((t) => {
    return {
      id: t.account.id,
      address: t.account.address,
      data: t.account.data as AccountMetadata,
      role: (t.role?.data as RoleMetadata)?.value,
      skills: t.account.skills.map(({ skill }) => skill.name),
    }
  })

  return accounts as Account[]
}
