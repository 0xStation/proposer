export enum StationPlatformTagValues {
  STATION_ADMIN = "station admin",
}

export enum TagType {
  STATUS = "status",
  ROLE = "role",
  PROJECT = "project",
  GUILD = "guild",
  TOKEN = "token",
  CHECKBOOK_SIGNER = "checkbook signer",
}

export enum TokenType {
  ERC20 = "ERC20",
  ERC721 = "ERC721",
  ERC1155 = "ERC1155",
}

export type TagTokenMetadata = {
  chainId: number
  address: string
  type: TokenType
  name: string
  symbol: string
}

export type Tag = {
  id: number
  terminalId: number
  // usually label of tag
  value: string
  type: TagType
  active: boolean
  discordId?: string
  data?: TagTokenMetadata | any
}
