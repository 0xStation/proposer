import db from "db"
import * as z from "zod"
import { Ctx } from "blitz"

const UpdatePayment = z.object({
  paymentId: z.string(),
  gnosisTxData: z.object({
    safeAddress: z.string().optional(),
    txId: z.string().optional(),
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

  // should do some auth on this, but its pretty annoying rn for gnosis safes
  // you'd have to look at the proposal from the proposal payment
  // check the client, realize its a gnosis safe, then fetch the signers on the safe
  // ctx.session.$authorize([], [])

  const payment = await db.proposalPayment.update({
    where: { id: params.paymentId },
    data: {
      data: {
        ...(existingPayment.data as {}),
        ...(params.gnosisTxData && {
          gnosis: {
            safeAddress: params.gnosisTxData.safeAddress,
            txId: params.gnosisTxData.txId,
          },
        }),
      },
    },
  })

  return payment
}
