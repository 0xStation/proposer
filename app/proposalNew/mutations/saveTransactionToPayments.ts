import * as z from "zod"
import db from "db"

const SaveTransactionHashToPayments = z.object({
  proposalId: z.string(),
  milestoneIndex: z.number(),
  transactionHash: z.string(),
})

export default async function saveTransactionHashToPayments(
  input: z.infer<typeof SaveTransactionHashToPayments>
) {
  const params = SaveTransactionHashToPayments.parse(input)

  // batch operate proposal milestone incrementing and payment transaction saving for ACID guarantees
  await db.$transaction(async (db) => {
    const proposal = await db.proposalNew.findUnique({
      where: { id: params.proposalId },
    })

    if (!proposal) throw Error("proposal not found")
    if (proposal.currentMilestoneIndex !== params.milestoneIndex)
      throw Error("proposal is not on milestone: " + params.milestoneIndex)

    // update payments with transaction hash
    await db.proposalPayment.updateMany({
      where: {
        proposalId: params.proposalId,
        milestoneIndex: params.milestoneIndex,
      },
      data: {
        transactionHash: params.transactionHash,
      },
    })

    // increment proposal's milestone
    await db.proposalNew.update({
      where: { id: params.proposalId },
      data: {
        currentMilestoneIndex: params.milestoneIndex + 1,
      },
    })
  })

  return true
}
