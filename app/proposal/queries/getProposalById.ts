import db from "db"
import * as z from "zod"
import { ProposalStatus as PrismaProposalStatus } from "@prisma/client"
import { Proposal, ProposalStatus as ProductProposalStatus } from "../types"
import { ProposalStatus as PrismaProposalStatus } from "db"

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

  return {
    ...proposal,
    status:
      proposal.status === PrismaProposalStatus.PUBLISHED
        ? ProductProposalStatus.SUBMITTED
        : proposal.status,
  } as unknown as Proposal
}
