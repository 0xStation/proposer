import db from "db"
import * as z from "zod"
import { request, gql } from "graphql-request"
import { Terminal } from "../types"

const GetTerminalsByAccount = z.object({
  address: z.string().optional(),
})

export default async function getTerminalsByAccount(input: z.infer<typeof GetTerminalsByAccount>) {
  const params = GetTerminalsByAccount.parse(input)

  if (params.address === undefined) {
    return [] as Terminal[]
  }

  let FETCH_USERS_TICKETS_QUERY = gql`
  {
    tickets(where: { owner: "${params.address}" }) {
      terminal {
        tokenAddress
      }
    }
  }
`
  // need to look into subgraph to see which terminals a particular address is a part of
  let data = await request(
    "https://api.thegraph.com/subgraphs/name/akshaymahajans/stationtest",
    FETCH_USERS_TICKETS_QUERY
  )

  // the subgraph does not return full terminal information, for that, we need the web2 database
  // we can gather the tokenAddresses, which are stored in the web2 database, in order to pull
  // full records
  const tokenAddressesOfUsersTerminals = data.tickets.map((ticket) => ticket.terminal.tokenAddress)

  // grab the full terminal inforamtion based on the terminal tokenAddresses we got in the previous step
  const terminals = (await db.terminal.findMany({
    where: { ticketAddress: { in: tokenAddressesOfUsersTerminals } },
  })) as Terminal[]

  return terminals
}
