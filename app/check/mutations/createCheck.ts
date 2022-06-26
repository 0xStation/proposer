import db from "db"
import * as z from "zod"
import { useToken } from "wagmi"
import { zeroAddress } from "app/core/utils/constants"
import { Prisma } from "@prisma/client"

const CreateCheck = z.object({
  proposalId: z.string(),
  fundingAddress: z.string(),
  chainId: z.number(),
  recipientAddress: z.string(),
  tokenAddress: z.string(),
  tokenAmount: z.string(),
  tokenDecimals: z.number(),
})

export default async function createCheck(input: z.infer<typeof CreateCheck>) {
  // 1. clean token amount's decimal value
  // remove decimals after token's decimal precision, cleaner data saves ethers error risk later on frontend
  const tokenAmountDecimal = new Prisma.Decimal(input.tokenAmount)
  const cleanedTokenAmount = tokenAmountDecimal.toFixed(input.tokenDecimals)

  // 2. set deadline to some point in the future
  const deadline = new Date()
  // missing edge cases for days in a month, but good enough for now
  if (deadline.getMonth() < 12) {
    deadline.setMonth(deadline.getMonth() + 1)
  } else {
    deadline.setMonth(1)
    deadline.setFullYear(deadline.getFullYear() + 1)
  }

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
          tokenAmount: cleanedTokenAmount,
          nonce,
          deadline,
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
