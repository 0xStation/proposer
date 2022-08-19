import db from "db"
import * as z from "zod"
import { ProposalStatus as PrismaProposalStatus } from "@prisma/client"
import { Proposal, ProposalStatus as ProductProposalStatus } from "../types"
import { computeProposalStatus } from "../utils"

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

  const firstCheck = proposal.checks[0]
  if (firstCheck) {
    // todo - need to remove quorum from checkbook if we ever want to remove dep of checkbook
    const quorum = firstCheck.checkbook.quorum
    console.log("firstCheck.checkbook.quorum", firstCheck.checkbook.quorum)
    return {
      ...proposal,
      status: computeProposalStatus(proposal.approvals.length, quorum),
    } as unknown as Proposal
    // if first check does not exist, it means there can be no approvals. It must be in the sumbitted state
  } else {
    const status =
      proposal.status === PrismaProposalStatus.DELETED
        ? ProductProposalStatus.DELETED
        : ProductProposalStatus.SUBMITTED
    return {
      ...proposal,
      status,
    } as unknown as Proposal
  }
}
