import db from "db"
import * as z from "zod"
import { ProposalStatus as PrismaProposalStatus } from "@prisma/client"
import { ProposalMetadata } from "app/proposal/types"

const GetRfpApprovedProposalFunding = z.object({
  rfpId: z.string(),
  approvalQuorum: z.number(),
  tokenChainId: z.number(),
  tokenAddress: z.string(),
})

export default async function getRfpApprovedProposalFunding(
  input: z.infer<typeof GetRfpApprovedProposalFunding>
) {
  // grab the proposal ids where the proposalApprovals are above quorum
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
        _count: { gte: input.approvalQuorum },
      },
    },
    _count: {
      _all: true,
      proposalId: true,
    },
  })
  const proposalIds = proposalStatusGroup.map((g) => g.proposalId)
  // fetch approved proposals
  const approvedProposals = await db.proposal.findMany({
    where: {
      id: { in: proposalIds },
    },
  })
  // compute funding from approved proposals of token
  const approvedFunding = approvedProposals.reduce((acc, proposal) => {
    const funding = (proposal.data as unknown as ProposalMetadata)?.funding
    if (funding.token !== input.tokenAddress) {
      return acc
    } else {
      return acc + funding.amount
    }
  }, 0)

  return approvedFunding as unknown as number
}
