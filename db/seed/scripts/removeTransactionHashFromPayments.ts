// @ts-nocheck
// not checking typescript because I already applied schema changes and its complainign about missing fields
import db from "db"
import { ProposalPayment, ProposalPaymentStatus } from "app/proposalPayment/types"

const seed = async () => {
  const existingPayments = (await db.proposalPayment.findMany()) as ProposalPayment[]

  for (const payment of existingPayments) {
    await db.proposalPayment.update({
      where: { id: payment.id },
      data: {
        transactionHash: null,
        data: {
          ...(payment.data.token as {}),
          history: [
            {
              ...(payment.data?.multisigTransaction as {}),
              transactionHash: payment.transactionHash,
              // payments dont have timestamps so theres not much we can do
              // about migrating accurate timestamps
              timestamp: new Date(),
              // currently our app only supports these two states
              // so the migration script should be safe assuming the below
              ProposalPaymentStatus: payment.transactionHash
                ? ProposalPaymentStatus.SUCCESS
                : ProposalPaymentStatus.QUEUED,
            },
          ],
        },
      },
    })
  }

  console.log(existingPayments.length + " payments updated")
}

export default seed
