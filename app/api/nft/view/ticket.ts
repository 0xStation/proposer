import db from "db"
import type { NextApiRequest, NextApiResponse } from "next"
import { Account } from "app/account/types"

type TicketMetaData = {
  name: string
  description: string
  image_url: string
}

type Error = {
  error: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TicketMetaData | Error>
) {
  const address = req.query.address

  if (typeof address !== "string") {
    res
      .status(500)
      .json({ error: "Invalid url params, either missing address, or too many given." })
    return
  }

  const account = (await db.account.findUnique({
    where: {
      address,
    },
  })) as Account

  if (!account) {
    res.status(500).json({ error: "No account found for this address." })
    return
  }

  if (!account.data.ticketImage) {
    res.status(500).json({ error: "No image generated for this account." })
    return
  }

  res.status(200).json({
    name: "Terminal Ticket",
    description: "This is the ticket. Let's replace this junk copy with something else :)",
    image_url: account.data.ticketImage,
  })
}
