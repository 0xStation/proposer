import db from "db"
import * as z from "zod"
import { FundingSenderType } from "app/types"
import { ProposalMetadata } from "../types"

const AssignCheckbookToProposal = z.object({
  proposalId: z.string(),
  checkbookAddress: z.string(),
  chainId: z.number(),
})

export default async function assignCheckbookToProposal(
  input: z.infer<typeof AssignCheckbookToProposal>
) {
  const params = AssignCheckbookToProposal.parse(input)

  const checkbook = await db.checkbook.findFirst({
    where: {
      chainId: params.chainId,
      address: params.checkbookAddress,
    },
  })

  if (!checkbook) {
    throw Error("checkbook with address and chainId does not exist")
  }

  // put updating in a transaction to guarantee updating proposal metadata atomically
  const result = await db.$transaction(async (db) => {
    const proposal = await db.proposal.findUnique({
      where: {
        id: params.proposalId,
      },
    })

    if (!proposal) {
      throw Error("proposal does not exist")
    }

    const oldMetadata: ProposalMetadata = proposal?.data as unknown as ProposalMetadata

    if (oldMetadata.funding.chainId !== params.chainId) {
      throw Error("mismatch of chain id of checkbook and proposal funding token")
    }

    const newMetadata: ProposalMetadata = {
      ...oldMetadata,
      funding: {
        ...oldMetadata.funding,
        senderType: FundingSenderType.CHECKBOOK,
        senderAddress: params.checkbookAddress,
      },
    }

    await db.proposal.update({
      where: {
        id: params.proposalId,
      },
      data: {
        data: JSON.parse(JSON.stringify(newMetadata)),
      },
    })

    return true
  })

  return result
}