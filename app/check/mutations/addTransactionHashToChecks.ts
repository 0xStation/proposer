import db from "db"
import * as z from "zod"
import { Check } from "../types"

const AddTransactionHashToChecks = z.object({
  txnHash: z.string(),
  checkIds: z.string().array(),
})

export default async function addTransactionHashToChecks(
  input: z.infer<typeof AddTransactionHashToChecks>
) {
  const params = AddTransactionHashToChecks.parse(input)

  // auth a signature from safe signer

  await db.$transaction(
    params.checkIds.map((checkId) =>
      db.check.update({
        where: {
          id: checkId,
        },
        data: {
          txnHash: params.txnHash,
        },
      })
    )
  )

  return params.txnHash
}
