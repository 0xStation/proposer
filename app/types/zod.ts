import { TokenType } from "@prisma/client"
import * as z from "zod"

// use ZodToken.partial() for all optional fields
// https://github.com/colinhacks/zod#partial
export const ZodToken = z.object({
  chainId: z.number(),
  address: z.string(),
  type: z.enum([TokenType.COIN, TokenType.ERC20, TokenType.ERC721, TokenType.ERC1155]),
  name: z.string().optional(),
  symbol: z.string().optional(),
  decimals: z.number().optional().nullable(),
})

export const ZodMilestone = z.object({
  index: z.number(),
  title: z.string(),
})

export const ZodPayment = z.object({
  senderAddress: z.string(),
  recipientAddress: z.string(),
  amount: z.number().optional(),
  tokenId: z.number().optional(),
  milestoneIndex: z.number(),
  token: ZodToken,
})

export const ZodTemplate = z
  .object({
    key: z.string(),
    mapsTo: z.string(),
    value: z.any(),
    fieldType: z.string(),
  })
  .array()
