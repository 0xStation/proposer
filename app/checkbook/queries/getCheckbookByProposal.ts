import { ProposalMetadata } from "app/proposal/types"
import { FundingSenderType } from "app/types"
import db from "db"
import * as z from "zod"
import { Checkbook } from "../types"

const GetCheckbookByProposal = z.object({
  proposalId: z.string(),
})

export default async function getCheckbookByProposal(
  input: z.infer<typeof GetCheckbookByProposal>
) {
  const params = GetCheckbookByProposal.parse(input)

  const proposal = await db.proposal.findUnique({
    where: {
      id: params.proposalId,
    },
  })

  if (!proposal) {
    return null
  }

  const fundingMetadata = (proposal.data as unknown as ProposalMetadata).funding

  if (fundingMetadata.senderType !== FundingSenderType.CHECKBOOK) {
    return null
  }

  const checkbook = await db.checkbook.findFirst({
    where: {
      chainId: fundingMetadata.chainId,
      address: fundingMetadata.senderAddress,
    },
  })

  return checkbook as unknown as Checkbook
}
