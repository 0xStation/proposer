import db from "db"
import * as z from "zod"
import { zeroAddress } from "app/core/utils/constants"
import { Prisma } from "@prisma/client"
import { fetchTokenDecimals } from "app/utils/fetchTokenDecimals"

const CreateCheck = z.object({
  proposalId: z.string(),
  fundingAddress: z.string(),
  chainId: z.number(),
  recipientAddress: z.string(),
  tokenAddress: z.string(),
  tokenAmount: z.string(),
})

export default async function createCheck(input: z.infer<typeof CreateCheck>) {
  // 1. clean token amount's decimal value
  // remove decimals after token's decimal precision, cleaner data saves ethers error risk later on frontend
  const tokenDecimals =
    input.tokenAddress === zeroAddress
      ? 18 // ETH decimals
      : await fetchTokenDecimals(input.chainId, input.tokenAddress) // fetch from ERC20 contract
  const tokenAmountDecimal = new Prisma.Decimal(input.tokenAmount)
  const cleanedTokenAmount = tokenAmountDecimal.toFixed(tokenDecimals)

  // 2. set deadline to some point in the future
  const deadline = new Date()
  // automatic handling for rounding up on years and days for overflow -> https://www.w3schools.com/jsref/jsref_setmonth.asp
  deadline.setMonth(deadline.getMonth() + 1)

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
