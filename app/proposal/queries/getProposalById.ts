import db from "db"
import * as z from "zod"
import { Proposal } from "../types"

const GetProposalById = z.object({
  id: z.string(),
})

export default async function getProposalById(params: z.infer<typeof GetProposalById>) {
  const proposal = await db.proposal.findUnique({
    where: {
      id: params.id,
    },
    include: {
      roles: {
        include: {
          account: true,
        },
      },
      milestones: true,
      payments: true,
    },
  })

  if (!proposal) {
    return null
  }

  return proposal as unknown as Proposal
}
