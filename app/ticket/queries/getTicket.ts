import db from "db"
import * as z from "zod"
import { Ticket } from "../types"

const GetTicket = z.object({
  accountId: z.number().optional(),
  terminalId: z.number().optional(),
})

export default async function getTicket(input: z.infer<typeof GetTicket>) {
  const data = GetTicket.parse(input)

  if (!data.accountId || !data.terminalId) {
    return null
  }

  const ticket = await db.accountTerminal.findUnique({
    where: {
      accountId_terminalId: {
        accountId: data.accountId,
        terminalId: data.terminalId,
      },
    },
  })

  if (!ticket) {
    return null
  }

  return ticket as Ticket
}
