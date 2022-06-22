import db from "db"
import * as z from "zod"
import { Proposal } from "../types"

const GetProposalsByRfpId = z.object({
  rfpId: z.string(),
  statuses: z.string().array().optional(),
  page: z.number().optional().default(0),
  paginationTake: z.number().optional().default(50),
})

export default async function getProposalsByRfpId(params: z.infer<typeof GetProposalsByRfpId>) {
  const proposals = await db.proposal.findMany({
    where: {
      rfpId: params.rfpId,
    },
    include: {
      collaborators: {
        include: {
          account: true,
        },
      },
    },
    take: params.paginationTake,
    skip: params.page * params.paginationTake,
  })

  if (!proposals) {
    return null
  }

  return proposals as unknown as Proposal[]
}
