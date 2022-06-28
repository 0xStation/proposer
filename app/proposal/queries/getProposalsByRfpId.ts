import db from "db"
import * as z from "zod"
import { ProposalStatus as PrismaProposalStatus } from "@prisma/client"
import { Proposal } from "../types"
import { computeApprovalCountFilter, computeProposalStatus } from "../utils"

const GetProposalsByRfpId = z.object({
  rfpId: z.string(),
  statuses: z.string().array().optional().default([]),
  quorum: z.number(),
})

export default async function getProposalsByRfpId(input: z.infer<typeof GetProposalsByRfpId>) {
  let approvalCountFilter = computeApprovalCountFilter(input.statuses, input.quorum)

  let proposalsWhere = {}
  if (!approvalCountFilter) {
    // all or no filters applied, just get proposals by rfpId and submitted
    proposalsWhere = { rfpId: input.rfpId, status: PrismaProposalStatus.SUBMITTED }
  } else {
    const proposalStatusGroup = await db.proposalApproval.groupBy({
      where: {
        proposal: {
          rfpId: input.rfpId,
          status: PrismaProposalStatus.SUBMITTED,
        },
      },
      by: ["proposalId"],
      having: {
        proposalId: {
          _count: approvalCountFilter,
        },
      },
      _count: {
        _all: true,
        proposalId: true,
      },
    })

    const proposalIds = proposalStatusGroup.map((g) => g.proposalId)
    proposalsWhere = { id: { in: proposalIds } }
  }

  const proposals = await db.proposal.findMany({
    where: proposalsWhere,
    include: {
      collaborators: {
        include: {
          account: true,
        },
      },
      approvals: {
        include: {
          signerAccount: true,
        },
      },
      checks: {
        include: {
          recipientAccount: true,
        },
      },
    },
  })

  if (!proposals) {
    return null
  }

  return proposals.map((p) => {
    return {
      ...p,
      status: computeProposalStatus(p.approvals.length, input.quorum),
    }
  }) as unknown as Proposal[]
}
