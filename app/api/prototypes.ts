import { BlitzApiHandler, useRouterQuery } from "blitz"
import db from "db"
import { titleCase } from "app/core/utils/titleCase"

type TicketQuery = {
  ticket: string
  owner: string
}

// fetch from [endpoint]/api/prototypes
const handler: BlitzApiHandler = async (req, res) => {
  const query = req.query as TicketQuery

  const account = await db.account.findUnique({
    where: { address: query.owner },
  })

  if (!account) {
    console.log("no account!")
    res.statusCode = 404
    return
  }

  const terminal = await db.terminal.findUnique({
    where: { ticketAddress: query.ticket },
    include: {
      tickets: {
        where: {
          accountId: account.id,
        },
        include: {
          role: true,
        },
      },
      initiatives: {
        include: {
          accounts: {
            where: { accountId: account.id },
          },
        },
      },
    },
  })

  if (!terminal) {
    console.log("no terminal!")
    res.statusCode = 404
    return
  }

  let attributes = [{ trait_type: "Status", value: "Active" }]
  attributes.push({ trait_type: "Role", value: titleCase(terminal.tickets[0]?.role?.data.name) })
  attributes.push({
    trait_type: "Joined At",
    display_type: "date",
    value: Math.round(terminal.tickets[0]?.joinedAt.getTime() / 1000),
  })

  terminal?.initiatives.forEach((i) => {
    if (i.accounts.length > 0) {
      attributes.push({ trait_type: "Initiative", value: i.data.name })
    }
  })

  let payload = {
    name: "Station Contributor NFT",
    description: "Contributor NFT for the Station Labs Terminal.",
    external_url: "https://station.express/",
    image: "https://pbs.twimg.com/profile_images/1465787628553310211/DOMgJi5d_400x400.jpg",
    attributes,
  }

  res.statusCode = 200
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(payload))
}
export default handler
