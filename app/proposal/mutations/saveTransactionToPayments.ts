import * as z from "zod"
import db, { ProposalStatus } from "db"
import { ProposalPayment, ProposalPaymentStatus } from "app/proposalPayment/types"

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

    const existingPayment = (await db.proposalPayment.findUnique({
      where: { id: params.paymentId },
    })) as ProposalPayment

    // non-gnosis safe payments have no history because there is no concept of the payment being "queued"
    // it either doesn't exist -- or it is immediately executed
    const mostRecentPaymentAttempt = existingPayment.data?.history?.slice(-1)[0]

    // update most recent payment attempt with transaction hash
    await db.proposalPayment.update({
      where: { id: params.paymentId },
      data: {
        data: {
          ...(existingPayment.data as {}),
          history: [
            ...existingPayment.data.history.slice(0, existingPayment.data.history.length - 1),
            {
              ...mostRecentPaymentAttempt,
              transactionHash: params.transactionHash,
              status: ProposalPaymentStatus.SUCCESS,
              timestamp: new Date(),
            },
          ] as any,
        },
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
