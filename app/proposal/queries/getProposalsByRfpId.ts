import db from "db"
import * as z from "zod"
import { ProposalStatus as PrismaProposalStatus } from "@prisma/client"
import { ProposalStatus as ProductProposalStatus, Proposal } from "../types"

const GetProposalsByRfpId = z.object({
  rfpId: z.string(),
  statuses: z.string().array().optional().default([]),
  quorum: z.number(),
})

export default async function getProposalsByRfpId(input: z.infer<typeof GetProposalsByRfpId>) {
  /**
   * Submitted: db status = PUBLISHED && approval count = 0
   * In review: db status = PUBLISHED && approval count > 0, < quorum
   * Approved: db status = PUBLISHED && approval count = quorum
   */
  let approvalCountFilter = {}
  const s = input.statuses
  if (s === [ProductProposalStatus.SUBMITTED]) {
    approvalCountFilter = { equals: 0 }
  } else if (s === [ProductProposalStatus.IN_REVIEW]) {
    approvalCountFilter = { gt: 0, lt: input.quorum }
  } else if (s === [ProductProposalStatus.APPROVED]) {
    approvalCountFilter = { equals: input.quorum }
  } else if (
    s.includes(ProductProposalStatus.SUBMITTED) &&
    s.includes(ProductProposalStatus.IN_REVIEW) &&
    s.length === 2
  ) {
    approvalCountFilter = { lt: input.quorum }
  } else if (
    s.includes(ProductProposalStatus.SUBMITTED) &&
    s.includes(ProductProposalStatus.APPROVED) &&
    s.length === 2
  ) {
    approvalCountFilter = { in: [0, input.quorum] }
  } else if (
    s.includes(ProductProposalStatus.IN_REVIEW) &&
    s.includes(ProductProposalStatus.APPROVED) &&
    s.length === 2
  ) {
    approvalCountFilter = { gt: 0 }
  } else if (
    s.includes(ProductProposalStatus.SUBMITTED) &&
    s.includes(ProductProposalStatus.IN_REVIEW) &&
    s.includes(ProductProposalStatus.APPROVED) &&
    s.length === 3
  ) {
    // keep filters as empty object
  } else {
    // no status filters applied
    // keep filters as empty object
  }

  let proposalsWhere = {}
  if (approvalCountFilter !== {}) {
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

    console.log(proposalStatusGroup)

    const proposalIds = proposalStatusGroup.map((g) => g.proposalId)

    proposalsWhere = { id: { in: proposalIds } }
  } else {
    // all or no filters applied, just get proposals by rfpId
    proposalsWhere = { rfpId: input.rfpId, status: PrismaProposalStatus.PUBLISHED }
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

  return proposals as unknown as Proposal[]
}
