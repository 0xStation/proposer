import { BlitzApiRequest, BlitzApiResponse, useRouterQuery } from "blitz"
import db from "db"
import { toTitleCase } from "app/core/utils/titleCase"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { RoleMetadata } from "app/role/types"
import { InitiativeMetadata } from "app/initiative/types"
import { AccountMetadata } from "app/account/types"
import { AccountInitiativeStatus } from "app/core/utils/constants"
import { TerminalMetadata } from "app/terminal/types"

type TicketQuery = {
  ticket: string
  owner: string
}

type Attribute = {
  trait_type: string
  value: string | number
  display_type?: string
}

const errorMessage = (message: string) => {
  return JSON.stringify({
    error: message,
  })
}

// Public endpoint for returning Station's metadata for a particular terminal and account.
// Station-minted Contributor NFTs will point to this route by default, allowing our
// metadata to render in Opensea's trait-based system and all products built on top of their API.
export default async function handler(req: BlitzApiRequest, res: BlitzApiResponse) {
  const { ticket, owner } = req.query as TicketQuery

  const account = await db.account.findUnique({
    where: { address: toChecksumAddress(owner) },
  })

  if (!account) {
    res.statusCode = 404
    res.end(errorMessage("account not found"))
    return
  }

  const terminal = await db.terminal.findUnique({
    where: { ticketAddress: toChecksumAddress(ticket) },
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
            where: { accountId: account.id, status: AccountInitiativeStatus.CONTRIBUTOR },
          },
        },
      },
    },
  })

  if (!terminal) {
    res.statusCode = 404
    res.end(errorMessage("terminal not found"))
    return
  }

  const accountTerminal = terminal.tickets[0]

  if (!accountTerminal) {
    res.statusCode = 404
    res.end(errorMessage("account is not member of terminal"))
    return
  }

  let attributes: Attribute[] = []
  attributes.push({
    trait_type: "Status",
    value: accountTerminal.active ? "Active" : "Inactive",
  })
  attributes.push({
    trait_type: "Role",
    value: toTitleCase((accountTerminal.role?.data as RoleMetadata)?.name),
  })
  attributes.push({
    trait_type: "Joined Since",
    display_type: "date",
    value: Math.round(accountTerminal.joinedAt.getTime() || 0 / 1000),
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
    description: `Contributor NFT for the ${(terminal.data as TerminalMetadata)?.name} Terminal.`,
    // TODO: add link to contributor's public profile page to description once complete
    external_url: "https://station.express/",
    image: imageMap[terminal.tickets[0]?.role?.localId || 4],
    attributes,
  }

  res.statusCode = 200
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(payload))
}
