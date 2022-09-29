import db from "db"
import * as z from "zod"
import { Proposal } from "../types"
import { PAGINATION_TAKE } from "app/core/utils/constants"

const GetAllProposals = z.object({
  page: z.number().optional().default(0),
  paginationTake: z.number().optional().default(PAGINATION_TAKE),
})

export default async function getAllProposals(input: z.infer<typeof GetAllProposals>) {
  const params = GetAllProposals.parse(input)

  const accounts = await db.proposal.findMany({
    take: params.paginationTake,
    skip: params.page * params.paginationTake,
  })

  return accounts as Proposal[]
}
