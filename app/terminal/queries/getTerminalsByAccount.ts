import db from "db"
import * as z from "zod"
import { TerminalMetadata } from "app/terminal/types"

const GetTerminalsByAccount = z.object({
  accountId: z.number(),
})

export default async function getTerminalsByAccount(input: z.infer<typeof GetTerminalsByAccount>) {
  const params = GetTerminalsByAccount.parse(input)
  const tickets = await db.accountTerminal.findMany({
    include: {
      terminal: true,
    },
    where: {
      accountId: params.accountId,
    },
  })

  return tickets
    .map((ticket) => ({
      ...ticket.terminal,
    }))
    .filter((t) => !(t.data as TerminalMetadata).hide)
}
