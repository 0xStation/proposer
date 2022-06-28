import db from "db"
import * as z from "zod"
import { ProposalStatus as PrismaProposalStatus } from "@prisma/client"
import { Proposal } from "../types"
import { computeApprovalCountFilter, computeProposalStatus } from "../utils"
import { ProposalStatus as ProductProposalStatus } from "app/proposal/types"

const GetProposalsByRfpId = z.object({
  rfpId: z.string(),
  statuses: z.string().array().optional().default([]),
  quorum: z.number(),
  page: z.number().optional().default(0),
  paginationTake: z.number().optional().default(50),
})

export default async function getProposalsByRfpId(input: z.infer<typeof GetProposalsByRfpId>) {
  let submittedFilter = {}
  if (input.statuses && input.statuses?.length) {
    submittedFilter =
      (input.statuses.includes(ProductProposalStatus.SUBMITTED) && { approvals: { none: {} } }) ||
      submittedFilter
  }

  let approvalCountFilter = computeApprovalCountFilter(input.statuses, input.quorum)

  let proposalStatusGroupFilter = {}
  if (approvalCountFilter) {
    const proposalStatusGroup = await db.proposalApproval.groupBy({
      where: {
        proposal: {
          rfpId: input.rfpId,
          status: PrismaProposalStatus.PUBLISHED,
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
    proposalStatusGroupFilter = { id: { in: proposalIds } }
  }

  let proposalsWhere = {}
  if (Object.keys(submittedFilter).length || Object.keys(proposalStatusGroupFilter).length) {
    proposalsWhere = {
      OR: [
        {
          ...submittedFilter,
        },
        { ...proposalStatusGroupFilter },
      ],
    }
  }

  const proposals = await db.proposal.findMany({
    where: {
      rfpId: input.rfpId,
      status: PrismaProposalStatus.PUBLISHED,
      ...proposalsWhere,
    },
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
    take: input.paginationTake,
    skip: input.page * input.paginationTake,
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
