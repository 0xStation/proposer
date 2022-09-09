// convenience metadata for application consumption, metadata is verifiable on-chain
export type Token = {
  chainId: number
  address: string
  type?: TokenType
  name?: string
  symbol?: string
  decimals?: number
}

export enum TokenType {
  COIN = "COIN",
  ERC20 = "ERC20",
  ERC721 = "ERC721",
  ERC1155 = "ERC1155",
}
