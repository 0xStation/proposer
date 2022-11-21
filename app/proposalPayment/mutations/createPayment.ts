import db, { AddressType } from "db"
import * as z from "zod"
import { Ctx } from "blitz"

const CreatePayment = z.object({
  proposalId: z.string(),
  milestoneId: z.string(),
  recipientAddress: z.string(),
  senderAddress: z.string(),
  multisigTransaction: z.object({
    address: z.string(),
    safeTxHash: z.string(),
    nonce: z.number(),
    transactionId: z.string(),
  }),
})

export default async function updatePayment(input: z.infer<typeof CreatePayment>, ctx: Ctx) {
  const params = CreatePayment.parse(input)

  // TODO: better auth
  ctx.session.$authorize([], [])

  const payment = await db.proposalPayment.create({
    data: {
      senderAddress: params.senderAddress,
      recipientAddress: params.recipientAddress,
      proposalId: params.proposalId,
      milestoneId: params.milestoneId,
      data: {
        multisigTransaction: {
          type: AddressType.SAFE,
          nonce: params.multisigTransaction.nonce,
          address: params.multisigTransaction.address,
          safeTxHash: params.multisigTransaction.safeTxHash,
          transactionId: params.multisigTransaction.transactionId,
        },
      },
    },
  })

  return payment
}
