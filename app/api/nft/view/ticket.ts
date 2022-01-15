import db from "db"
import type { NextApiRequest, NextApiResponse } from "next"
import { Account } from "app/account/types"

type TicketMetaData = {
  name: string
  description: string
  image: string
}

type Error = {
  error: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TicketMetaData | Error>
) {
  const address = req.query.owner
  const ticket_address = req.query.ticket

  if (typeof address !== "string") {
    res
      .status(500)
      .json({ error: "Invalid url params, either missing address, or too many given." })
    return
  }

  const account = await db.account.findUnique({
    where: {
      address,
    },
    include: {
      tickets: true,
    },
  })

  console.log(account)
  const terminalIds = account?.tickets.map((ticket) => ticket.terminalId)

  if (!terminalIds) {
    res.status(500).json({ error: "This account is not in any terminals" })
    return
  }

  const terminals = await db.terminal.findMany({
    where: {
      id: { in: terminalIds },
    },
  })

  const activeTerminal = terminals.find((terminal) => terminal.ticketAddress === ticket_address)

  if (!activeTerminal) {
    res.status(500).json({ error: "No terminal with the provided ticket address" })
    return
  }

  const activeTicket = account?.tickets.find((ticket) => ticket.terminalId === activeTerminal.id)

  if (!activeTicket) {
    res.status(500).json({ error: "No active ticket found" })
    return
  }

  res.status(200).json({
    name: "Terminal Ticket",
    description: "This is the ticket. Wow!",
    image: activeTicket.ticketUrl,
  })
}
