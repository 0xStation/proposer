import db from "db"
import * as z from "zod"
import { Ctx } from "blitz"

const CashCheck = z.object({
  checkId: z.string(),
  txnHash: z.string(),
})

export default async function cashCheck(input: z.infer<typeof CashCheck>, ctx: Ctx) {
  const check = await db.check.findUnique({
    where: {
      id: input.checkId,
    },
  })

  if (!check) {
    throw new Error("Cannot cash a check that does not exist.")
  }

  ctx.session.$authorize([check?.recipientAddress], [])

  try {
    const updatedCheck = await db.check.update({
      where: { id: input.checkId },
      data: {
        txnHash: input.txnHash,
      },
    })
    return updatedCheck
  } catch (e) {
    console.error("Check updating failed", e)
    throw e
  }
}
