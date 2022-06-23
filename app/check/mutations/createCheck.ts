import db from "db"
import * as z from "zod"

const CreateCheck = z.object({
  proposalId: z.string(),
  fundingAddress: z.string(),
  chainId: z.number(),
  recipientAddress: z.string(),
  tokenAddress: z.string(),
  tokenAmount: z.number(),
  deadline: z.date(),
})

export default async function createCheck(input: z.infer<typeof CreateCheck>) {
  try {
    // batch nonce generation and check creation in transaction for ACID guarantees to solve nonce race conditions
    const check = await db.$transaction(async (db) => {
      const lastCheck = await db.check.findFirst({
        where: {
          fundingAddress: input.fundingAddress,
        },
        orderBy: {
          nonce: "desc",
        },
      })

      const nonce = (lastCheck?.nonce || 0) + 1

      const check = await db.check.create({
        data: {
          ...input,
          nonce,
        },
      })

      return check
    })
    return check
  } catch (e) {
    console.error("Check creation failed", e)
    throw e
  }
}
