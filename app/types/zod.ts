import * as z from "zod"

export const ZodToken = z.object({
  chainId: z.number(),
  address: z.string(),
  name: z.string().optional(),
  symbol: z.string().optional(),
  decimals: z.number().optional(),
})

export const OptionalZodToken = z.object({
  chainId: z.number().optional(),
  address: z.string().optional(),
  name: z.string().optional(),
  symbol: z.string().optional(),
  decimals: z.number().optional(),
})
