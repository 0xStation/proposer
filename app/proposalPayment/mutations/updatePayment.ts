import db, { AddressType } from "db"
import * as z from "zod"
import { Ctx } from "blitz"

const UpdatePayment = z.object({
  paymentId: z.string(),
  isError: z.boolean().optional(),
  isRejected: z.boolean().optional(),
  multisigTransaction: z.object({
    address: z.string().optional(),
    safeTxHash: z.string().optional(),
    nonce: z.number().optional(),
    transactionId: z.string().optional(),
  }),
})

export default async function updatePayment(input: z.infer<typeof UpdatePayment>, ctx: Ctx) {
  const params = UpdatePayment.parse(input)

  const existingPayment = await db.proposalPayment.findUnique({
    where: { id: params.paymentId },
  })

  if (!existingPayment) {
    console.error("cannot update a payment that does not exist.")
    return null
  }

  // fairly annoying to do a proper auth check
  // you'd have to look at the proposal from the proposal payment
  // check the client, realize its a gnosis safe, then fetch the signers on the safe
  // for now we are calling auth with empty lists to at least require that session exists
  ctx.session.$authorize([], [])

  const payment = await db.proposalPayment.update({
    where: { id: params.paymentId },
    data: {
      isError: params.isError || existingPayment.isError,
      isRejected: params.isRejected || existingPayment.isRejected,
      data: {
        ...(existingPayment.data as {}),
        ...(params.multisigTransaction && {
          multisigTransaction: {
            type: AddressType.SAFE,
            nonce: params.multisigTransaction.nonce,
            address: params.multisigTransaction.address,
            safeTxHash: params.multisigTransaction.safeTxHash,
            transactionId: params.multisigTransaction.transactionId,
          },
        }),
      },
    },
  })

  return payment
}
