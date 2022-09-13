import * as z from "zod"
import db from "db"

const SaveTransactionHashToPayments = z.object({
  paymentIds: z.string().array(),
  transactionHash: z.string(),
})

export default async function saveTransactionHashToPayments(
  input: z.infer<typeof SaveTransactionHashToPayments>
) {
  const params = SaveTransactionHashToPayments.parse(input)

  const results = db.proposalPayment.updateMany({
    where: {
      id: { in: params.paymentIds },
    },
    data: {
      transactionHash: params.transactionHash,
    },
  })

  return results
}
