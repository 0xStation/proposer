import { TokenType } from "@prisma/client"
import * as z from "zod"

// use ZodToken.partial() for all optional fields
// https://github.com/colinhacks/zod#partial
export const ZodToken = z.object({
  type: z.enum([TokenType.COIN, TokenType.ERC20, TokenType.ERC721, TokenType.ERC1155]),
  chainId: z.number(),
  address: z.string(),
  name: z.string().optional(),
  symbol: z.string().optional(),
  decimals: z.number().optional(),
})

export const ZodMilestone = z.object({
  index: z.number(),
  title: z.string(),
})

export const ZodPayment = z.object({
  milestoneIndex: z.number(),
  senderAddress: z.string(),
  recipientAddress: z.string(),
  amount: z.number().optional(),
  tokenId: z.number().optional(),
  token: ZodToken,
})

export const ZodMilestoneWithPayments = z.object({
  index: z.number(),
  title: z.string(),
  payments: z
    .object({
      senderAddress: z.string(),
      recipientAddress: z.string(),
      amount: z.number().optional(),
      tokenId: z.number().optional(),
      token: ZodToken,
    })
    .array(),
})
