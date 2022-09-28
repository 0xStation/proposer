import * as z from "zod"
import db from "db"
import { ProposalPayment } from "app/proposalPayment/types"

const SaveTransactionHashToPayments = z.object({
  milestoneId: z.string(),
  proposalId: z.string(),
  transactionHash: z.string(),
})

export default async function saveTransactionHashToPayments(
  input: z.infer<typeof SaveTransactionHashToPayments>
) {
  const params = SaveTransactionHashToPayments.parse(input)

  // batch operate proposal milestone incrementing and payment transaction saving for ACID guarantees
  const updatedPayment = await db.$transaction(async (db) => {
    const proposal = await db.proposal.findUnique({
      where: { id: params.proposalId },
    })

    const milestone = await db.proposalMilestone.findUnique({
      where: { id: params.milestoneId },
    })

    if (!milestone) throw Error("milestone not found")
    if (!proposal) throw Error("proposal not found")

    if (proposal.currentMilestoneIndex !== milestone.index)
      throw Error("proposal is not on milestone: " + milestone.index)

    // update payments with transaction hash
    await db.proposalPayment.updateMany({
      where: {
        milestoneId: params.milestoneId,
      },
      data: {
        transactionHash: params.transactionHash,
      },
    })

    const updatedPayments = await db.proposalPayment.findMany({
      where: {
        milestoneId: params.milestoneId,
      },
    })

    return updatedPayments
  })

  return updatedPayment
}
