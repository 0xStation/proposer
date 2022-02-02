import db from "db"
import type { NextApiRequest, NextApiResponse } from "next"

type TicketMetaData = {
  name: string
  description: string
  image: string
}

type Error = {
  error: string
}

/**
 * API endpoint that returns ticket metadata.
 * @param {string} address - (req.query param) the address of the owner of the NFT
 * @param {string} ticketAddress - (req.query param) the address of the terminal token contract
 *
 * @todo possibly refactor this a bit, does not feel super clean.
 * We need the imageURL of the ticket for a given account address and terminal ticketAddress.
 * The "tickets" table joins accounts to terminals, and has the imageURL. Unfortunately, it does not have
 * address information for either the account or the terminal, it only joins on the database primary keys.
 * For that reason, we need to pull in all of the account information and terminal information so we can compare
 * the addresses given, and compare that back to the primary keys so we can eventually find the correct row of the
 * tikets table.
 *
 * Possibly a cleaner way to do this, but I don't think it's worth the time to concern ourselves with these matters
 * right now since it's working and we should focus on getting and MVP out.
 */
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

  // Looking into our postgres database for the account with the given address
  // we need to do this to get the list of terminals the account is linked to
  // this is found in the table joining accounts and terminals called "tickets"
  const account = await db.account.findUnique({
    where: {
      address,
    },
    include: {
      tickets: true,
    },
  })

  const terminalIds = account?.tickets.map((ticket) => ticket.terminalId)

  if (!terminalIds) {
    res.status(500).json({ error: "This account is not in any terminals" })
    return
  }

  // We need the full teminal information for each terminal that the user is a part of.
  // The join table results from the query above only include the ID, but we are interested in the terminal address
  const terminals = await db.terminal.findMany({
    where: {
      id: { in: terminalIds },
    },
  })

  // this is the terminal we are interested in
  const linkedTerminal = terminals.find((terminal) => terminal.ticketAddress === ticket_address)

  if (!linkedTerminal) {
    res.status(500).json({ error: "No terminal with the provided ticket address" })
    return
  }

  // we are interested in the row of data of the ticket join table that includes the id of the terminal
  // we are interested because that row also contains the imageURL, which is really the only thing we are after
  const linkedTicket = account?.tickets.find((ticket) => ticket.terminalId === linkedTerminal.id)

  if (!linkedTicket) {
    res.status(500).json({ error: "No active ticket found" })
    return
  }

  res.status(200).json({
    name: "Terminal Ticket",
    description: "This is the ticket. Wow!",
    image: linkedTicket.ticketUrl || "",
  })
}
