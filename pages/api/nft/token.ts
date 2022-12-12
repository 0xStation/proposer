import { api } from "app/blitz-server"
import { NextApiRequest, NextApiResponse } from "next"
import db from "db"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { AccountMetadata } from "app/account/types"

type TicketQuery = {
  address: string
  tokenId: string
  owner: string
}

const errorMessage = (message: string) => {
  return JSON.stringify({
    error: message,
  })
}

// Public endpoint for returning Station's metadata for a particular terminal and account.
// Station-minted Contributor NFTs will point to this route by default, allowing our
// metadata to render in Opensea's trait-based system and all products built on top of their API.
export default api(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { owner } = req.query as TicketQuery

  const account = await db.account.findUnique({
    where: { address: toChecksumAddress(owner) },
  })

  if (!account) {
    res.statusCode = 404
    res.end(errorMessage("account not found"))
    return
  }

  const acctName = (account.data as unknown as AccountMetadata)?.name

  let payload = {
    name: acctName,
    description: "Check us out at https://station.express",
    external_url: "https://station.express",
    image: "https://station-images.nyc3.digitaloceanspaces.com/station.jpeg",
    attributes: [],
  }

  res.statusCode = 200
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(payload))
})
