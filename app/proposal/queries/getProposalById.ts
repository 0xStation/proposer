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
      collaborators: {
        include: {
          account: true,
        },
      },
      checks: {
        include: {
          recipientAccount: true,
          approvals: true,
          checkbook: true,
        },
      },
      approvals: {
        include: {
          signerAccount: true,
        },
      },
    },
  })

  if (!proposal) {
    return null
  }

  return proposal as unknown as Proposal
}
