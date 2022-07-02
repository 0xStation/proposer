import db from "db"
import * as z from "zod"
import { ProposalStatus as PrismaProposalStatus } from "@prisma/client"
import { Proposal } from "../types"
import { computeProposalDbFilterFromProposalApprovals, computeProposalStatus } from "../utils"
import { PAGINATION_TAKE } from "app/core/utils/constants"

const GetProposalsByRfpId = z.object({
  rfpId: z.string(),
  statuses: z.string().array().optional().default([]),
  quorum: z.number(),
  page: z.number().optional().default(0),
  paginationTake: z.number().optional().default(PAGINATION_TAKE),
})

export default async function getProposalsByRfpId(input: z.infer<typeof GetProposalsByRfpId>) {
  const proposalsWhere = await computeProposalDbFilterFromProposalApprovals({
    statuses: input.statuses,
    quorum: input.quorum,
    rfpId: input.rfpId,
  })

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
