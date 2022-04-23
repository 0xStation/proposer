import { BlitzApiRequest, BlitzApiResponse } from "blitz"
import db from "db"
import { toTitleCase } from "app/core/utils/titleCase"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { RoleMetadata } from "app/role/types"
import { InitiativeMetadata } from "app/v1/initiative/types"
import { AccountMetadata } from "app/account/types"
import { AccountInitiativeStatus } from "app/core/utils/constants"
import { Terminal, TerminalMetadata } from "app/v1/terminal/types"
import { getNftImageUrl } from "app/utils/getNftImageUrl"
import { TraitTypes, DisplayTypes, Ticket } from "app/ticket/types"

type TicketQuery = {
  address: string
  tokenId: string
  owner: string
}

type Attribute = {
  trait_type: string
  value: string | number
  display_type?: string
}

const makeAttribute = (
  traitType: string,
  value: string | number,
  displayType?: string
): Attribute => {
  let attr = {
    trait_type: traitType,
    value,
  }
  if (displayType) {
    attr["display_type"] = displayType
  }
  return attr
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
  const { address, tokenId, owner } = req.query as TicketQuery

  const account = await db.account.findUnique({
    where: { address: toChecksumAddress(owner) },
  })

  if (!account) {
    res.statusCode = 404
    res.end(errorMessage("account not found"))
    return
  }

  const terminal = await db.terminal.findUnique({
    where: { ticketAddress: toChecksumAddress(address) },
    include: {
      roles: true,
      tickets: {
        where: {
          accountId: account.id,
        },
      },
      initiatives: {
        include: {
          accounts: {
            where: { accountId: account.id, status: AccountInitiativeStatus.CONTRIBUTING },
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

  const accountTerminal = terminal.tickets[0] // from join query, should be 1 object list if ticket exists for account or empty list if not

  if (!accountTerminal) {
    res.statusCode = 404
    res.end(errorMessage("account is not member of terminal"))
    return
  }

  let image = getNftImageUrl(terminal as unknown as Terminal, accountTerminal as unknown as Ticket)

  // construct attributes list per Opensea's metadata standard schema: https://docs.opensea.io/docs/metadata-standards
  // note that Opensea renders in alphabetical order by trait type
  let attributes: Attribute[] = [
    makeAttribute(TraitTypes.STATUS, accountTerminal.active ? "Active" : "Inactive"),
    makeAttribute(
      TraitTypes.ROLE,
      toTitleCase(
        (
          terminal?.roles?.find((r) => r.localId === accountTerminal.roleLocalId)
            ?.data as RoleMetadata
        )?.name
      )
    ),
    makeAttribute(
      TraitTypes.JOINED_SINCE,
      Math.round(accountTerminal.joinedAt.getTime() || 0 / 1000),
      DisplayTypes.DATE
    ),
    ...terminal.initiatives
      .filter((i) => i.accounts.length > 0) // from the join query, `accounts` is length 1 if the account is a contributor to the initiative
      .map((i) => makeAttribute(TraitTypes.INITIATIVE, (i.data as InitiativeMetadata)?.name)),
  ]

  const acctName = (account.data as AccountMetadata)?.name

  let payload = {
    name: acctName,
    description: `Contributor NFT for the ${
      (terminal.data as TerminalMetadata)?.name
    } Terminal. [View ${acctName}'s full profile](https://staging.station.express/profile/${owner}).`,
    // TODO: add link to contributor's public profile page to description once complete
    external_url: "https://station.express/",
    image,
    attributes,
  }

  res.statusCode = 200
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(payload))
}
