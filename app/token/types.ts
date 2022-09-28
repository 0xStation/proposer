import { TokenType } from "@prisma/client"

// convenience metadata for application consumption, metadata is verifiable on-chain
export type Token = {
  chainId: number
  address: string
  type: TokenType
  name?: string
  symbol?: string
  decimals?: number
}
