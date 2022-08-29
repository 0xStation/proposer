import * as z from "zod"

export const ZodToken = z.object({
  chainId: z.number(),
  address: z.string(),
  name: z.string().optional(),
  symbol: z.string().optional(),
  decimals: z.number().optional(),
})
