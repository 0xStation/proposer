import db from "db"
import * as z from "zod"
import { ProposalStatus } from "@prisma/client"
import { ProposalMetadata } from "app/proposal/types"

const GetRfpApprovedProposalFunding = z.object({
  rfpId: z.string(),
  tokenChainId: z.number(),
  tokenAddress: z.string(),
})

export default async function getRfpApprovedProposalFunding(
  input: z.infer<typeof GetRfpApprovedProposalFunding>
) {
  // fetch approved proposals
  const approvedProposals = await db.proposal.findMany({
    where: {
      rfpId: input.rfpId,
      status: ProposalStatus.APPROVED,
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
