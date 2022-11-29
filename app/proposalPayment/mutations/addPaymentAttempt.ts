import db, { AddressType } from "db"
import * as z from "zod"
import { Ctx } from "blitz"
import { ProposalPayment, ProposalPaymentStatus } from "../types"

const AddPaymentAttempt = z.object({
  paymentId: z.string(),
  multisigTransaction: z.object({
    address: z.string(),
    safeTxHash: z.string(),
    nonce: z.number(),
    transactionId: z.string(),
  }),
})

export default async function addPaymentAttempt(
  input: z.infer<typeof AddPaymentAttempt>,
  ctx: Ctx
) {
  const params = AddPaymentAttempt.parse(input)

  const existingPayment = (await db.proposalPayment.findUnique({
    where: { id: params.paymentId },
  })) as ProposalPayment

  if (!existingPayment) {
    console.error("cannot update a payment that does not exist.")
    return null
  }

  // TODO: improve auth
  ctx.session.$authorize([], [])

  const payment = await db.proposalPayment.update({
    where: { id: params.paymentId },
    data: {
      ...existingPayment,
      data: {
        ...(existingPayment.data as {}),
        history: [
          ...(existingPayment.data?.history || []),
          {
            status: ProposalPaymentStatus.QUEUED,
            timestamp: new Date(),
            multisigTransaction: {
              type: AddressType.SAFE,
              nonce: params.multisigTransaction.nonce,
              address: params.multisigTransaction.address,
              safeTxHash: params.multisigTransaction.safeTxHash,
              transactionId: params.multisigTransaction.transactionId,
            },
          },
        ] as any,
      },
    },
  })

  return payment
}
