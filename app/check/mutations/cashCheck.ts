import db from "db"
import * as z from "zod"

const CashCheck = z.object({
  checkId: z.string(),
  txnHash: z.string(),
})

export default async function cashCheck(input: z.infer<typeof CashCheck>) {
  try {
    // batch nonce generation and check creation in transaction for ACID guarantees to solve nonce race conditions
    const check = await db.check.update({
      where: { id: input.checkId },
      data: {
        txnHash: input.txnHash,
      },
    })
    return check
  } catch (e) {
    console.error("Check cashing failed", e)
    throw e
  }
}
