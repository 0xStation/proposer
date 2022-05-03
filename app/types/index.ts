export type ExternalLink = {
  symbol: Symbol
  url: string
}

export enum Symbol {
  MIRROR,
  GITHUB,
  WEBSITE,
  TWITTER,
}

export enum Role {
  STAFF = "STAFF",
  DAILY_COMMUTER = "DAILY COMMUTER",
  WEEKEND_COMMUTER = "WEEKEND COMMUTER",
  VISITOR = "VISITOR",
}

export type TypedDataSignatureDomain = {
  name: string
  version: string
  chainId: number
  verifyingContract: string
}

export type TypedDataField = {
  name: string
  type: string // solidity type e.g. "address", "uint256", etc.
}

export type TypedDataTypeDefinition = Record<string, TypedDataField[]>
