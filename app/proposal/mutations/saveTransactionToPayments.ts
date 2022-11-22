import * as z from "zod"
import db, { ProposalStatus } from "db"

const SaveTransactionHashToPayments = z.object({
  milestoneId: z.string(),
  proposalId: z.string(),
  transactionHash: z.string(),
  paymentId: z.string(),
})

export default async function saveTransactionHashToPayments(
  input: z.infer<typeof SaveTransactionHashToPayments>
) {
  const params = SaveTransactionHashToPayments.parse(input)

  // batch operate proposal milestone incrementing and payment transaction saving for ACID guarantees
  await db.$transaction(async (db) => {
    const proposal = await db.proposal.findUnique({
      where: { id: params.proposalId },
      include: {
        milestones: true,
      },
    })

    const milestone = await db.proposalMilestone.findUnique({
      where: { id: params.milestoneId },
    })

    if (!milestone) throw Error("milestone not found")
    if (!proposal) throw Error("proposal not found")

    if (proposal.currentMilestoneIndex !== milestone.index)
      throw Error("proposal is not on milestone: " + milestone.index)

    // update payment with transaction hash
    await db.proposalPayment.update({
      where: { id: params.paymentId },
      data: {
        transactionHash: params.transactionHash,
      },
    })

    // increment proposal's milestone
    await db.proposal.update({
      where: { id: params.proposalId },
      data: {
        ...(milestone.index + 1 >= proposal.milestones.length && {
          status: ProposalStatus.COMPLETE,
        }),
        currentMilestoneIndex: milestone.index + 1,
      },
    })
  })

  return true
}
