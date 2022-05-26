export enum TagType {
  STATUS = "status",
  ROLE = "role",
  PROJECT = "project",
  GUILD = "guild",
  TOKEN = "token",
}

export enum TokenType {
  ERC20 = "ERC20",
  ERC721 = "ERC721",
  // assume no ERC1155 type for now
}

export type TagTokenMetadata = {
  chainId: number
  address: string
  type: TokenType
}

export type Tag = {
  id: number
  terminalId: number
  value: string
  type: TagType
  active: boolean
  discordId?: string
  data?: TagTokenMetadata | any
}
