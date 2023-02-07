import db from "db"
import * as z from "zod"
import { Check } from "../types"

const CreateCheck = z.object({
  inboxId: z.string().optional(),
  chainId: z.number(),
  address: z.string(),
  to: z.string(),
  value: z.string(),
  data: z.string(),
  title: z.string(),
  operation: z.number(),
  meta: z.any(),
})

export default async function createCheck(input: z.infer<typeof CreateCheck>) {
  const params = CreateCheck.parse(input)

  // auth a signature from safe signer

  const check = await db.$transaction(async (db) => {
    const highestNonceCheck = await db.check.findFirst({
      where: {
        chainId: params.chainId,
        address: params.address,
      },
      orderBy: {
        nonce: "desc",
      },
    })

    const newCheck = await db.check.create({
      data: {
        inboxId: params.inboxId,
        chainId: params.chainId,
        address: params.address,
        nonce: (highestNonceCheck?.nonce || 0) + 1,
        data: {
          title: params.title,
          meta: params.meta,
          txn: {
            to: params.to,
            value: params.value,
            data: params.data,
            operation: params.operation,
          },
        },
      },
    })

    return newCheck
  })

  return check as unknown as Check
}
