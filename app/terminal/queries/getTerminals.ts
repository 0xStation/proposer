import db from "db"
import * as z from "zod"
import { request, gql } from "graphql-request"
import { Terminal } from "../types"

const createQuery = (address: string) => {
  return gql`
  {
    tickets(where: { owner: "${address}" }) {
      terminal {
        tokenAddress
      }
    }
  }
`
}

const GetTerminals = z.object({
  address: z.string().optional(),
  isContributor: z.boolean().optional(),
  pagination: z.object({
    page: z.number().default(0),
    per_page: z.number().default(4),
  }),
})

export default async function getTerminals(input: z.infer<typeof GetTerminals>) {
  const params = GetTerminals.parse(input)

  let args: any = {}
  args.take = params.pagination.per_page + 1
  args.skip = params.pagination.page * params.pagination.per_page

  if (params.isContributor) {
    // if address is not provided by contributor toggle is active, should return empty
    if (!params.address) {
      return {
        hasNext: false,
        hasPrev: false,
        results: [],
        pages: 0,
        total: 0,
      }
    }

    let data = await request(
      "https://api.thegraph.com/subgraphs/name/akshaymahajans/stationtest",
      createQuery(params.address)
    )

    console.log(data.tickets)

    const contributorOfTerminalsWithAddresses = data.tickets.map(
      (ticket) => ticket.terminal.tokenAddress
    )
    args.where = { ticketAddress: { in: contributorOfTerminalsWithAddresses } }
  }

  const terminals = await db.terminal.findMany(args)
  let count = await db.terminal.count({ where: args.where })

  return {
    hasNext: terminals.length > params.pagination.per_page,
    hasPrev: params.pagination.page > 0,
    results: terminals.splice(0, params.pagination.per_page) as Terminal[],
    pages: Math.ceil(count / params.pagination.per_page),
    total: count,
  }
}
