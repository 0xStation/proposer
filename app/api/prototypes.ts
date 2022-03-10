import { BlitzApiHandler, useRouterQuery } from "blitz"
import db from "db"
import { titleCase } from "app/core/utils/titleCase"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { RoleMetadata } from "app/role/types"
import { InitiativeMetadata } from "app/initiative/types"
import { AccountMetadata } from "app/account/types"

type TicketQuery = {
  ticket: string
  owner: string
}

type Attribute = {
  trait_type: string
  value: string | number
  display_type?: string
}

// fetch from [endpoint]/api/prototypes
const handler: BlitzApiHandler = async (req, res) => {
  const query = req.query as TicketQuery

  const account = await db.account.findUnique({
    where: { address: toChecksumAddress(query.owner) },
  })

  if (!account) {
    res.statusCode = 404
    res.end("account not found")
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
    res.statusCode = 404
    res.end("terminal not found")
    return
  }

  let attributes: Attribute[] = [{ trait_type: "Status", value: "Active" }]
  attributes.push({
    trait_type: "Role",
    value: titleCase((terminal.tickets[0]?.role?.data as RoleMetadata)?.name),
  })
  attributes.push({
    trait_type: "Joined At",
    display_type: "date",
    value: Math.round(terminal.tickets[0]?.joinedAt.getTime() || 0 / 1000),
  })

  terminal?.initiatives.forEach((i) => {
    if (i.accounts.length > 0) {
      attributes.push({ trait_type: "Initiative", value: (i.data as InitiativeMetadata)?.name })
    }
  })

  const imageMap = {
    1: "https://station-images.nyc3.digitaloceanspaces.com/ticket-4.png",
    2: "https://station-images.nyc3.digitaloceanspaces.com/ticket-3.png",
    3: "https://station-images.nyc3.digitaloceanspaces.com/ticket-2.png",
    4: "https://station-images.nyc3.digitaloceanspaces.com/ticket-1.png",
  }

  let payload = {
    name: (account.data as AccountMetadata)?.name,
    description: "Contributor NFT for the Station Labs Terminal.",
    external_url: "https://station.express/",
    image: imageMap[terminal.tickets[0]?.role?.localId || 4],
    attributes,
  }

  res.statusCode = 200
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(payload))
}
export default handler
