import db from "db"
import * as z from "zod"
import { ProposalStatus as PrismaProposalStatus } from "@prisma/client"
import { Proposal } from "../types"
import { PAGINATION_TAKE } from "app/core/utils/constants"
import { ProposalStatus } from "../types"

const GetProposalsByRfpId = z.object({
  rfpId: z.string(),
  statuses: z.string().array().optional().default([]),
  page: z.number().optional().default(0),
  paginationTake: z.number().optional().default(PAGINATION_TAKE),
})

export default async function getProposalsByRfpId(input: z.infer<typeof GetProposalsByRfpId>) {
  const selectedStatuses = input.statuses.map((s) =>
    s === ProposalStatus.SUBMITTED ? PrismaProposalStatus.PUBLISHED : s
  ) as PrismaProposalStatus[]

  const proposals = await db.proposal.findMany({
    where: {
      rfpId: input.rfpId,
      ...(selectedStatuses.length > 0 && { status: { in: selectedStatuses } }),
    },
    include: {
      checks: true,
      approvals: {
        include: {
          signerAccount: true,
        },
      },
      collaborators: {
        include: {
          account: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: input.paginationTake,
    skip: input.page * input.paginationTake,
  })

  if (!proposals) {
    return null
  }

  return proposals.map((proposal) => {
    return {
      ...proposal,
      status:
        proposal.status === PrismaProposalStatus.PUBLISHED
          ? ProposalStatus.SUBMITTED
          : proposal.status,
    }
  }) as unknown as Proposal[]
}
