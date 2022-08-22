import * as z from "zod"

export enum TokenType {
  COIN = "COIN", // native coin of the underlying blockchain, used to pay gas
  ERC20 = "ERC20",
  ERC721 = "ERC721",
  ERC1155 = "ERC1155",
}

export type Token = {
  chainId: number
  address: string
  type?: TokenType
  name?: string
  symbol?: string
  decimals?: number
}

export const ZodToken = z.object({
  chainId: z.number(),
  address: z.string(),
  type: z.enum([TokenType.COIN, TokenType.ERC20, TokenType.ERC721, TokenType.ERC1155]),
  name: z.string().optional(),
  symbol: z.string().optional(),
  decimals: z.number().optional(),
})
