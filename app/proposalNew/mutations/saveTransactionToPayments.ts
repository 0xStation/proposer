import * as z from "zod"
import db from "db"

const SaveTransactionHashToPayments = z.object({
  proposalId: z.string(),
  paymentIds: z.string().array(),
  transactionHash: z.string(),
})

export default async function saveTransactionHashToPayments(
  input: z.infer<typeof SaveTransactionHashToPayments>
) {
  const params = SaveTransactionHashToPayments.parse(input)

  await db.$transaction(async (db) => {
    const proposal = await db.proposalNew.findUnique({
      where: { id: params.proposalId },
    })

    if (!proposal) throw Error("no proposal found")

    const nextMilestoneIndex = proposal.currentMilestoneIndex + 1

    await db.proposalNew.update({
      where: { id: params.proposalId },
      data: {
        currentMilestoneIndex: nextMilestoneIndex,
      },
    })

    await db.proposalPayment.updateMany({
      where: {
        id: { in: params.paymentIds },
      },
      data: {
        transactionHash: params.transactionHash,
      },
    })
  })

  return true
}
