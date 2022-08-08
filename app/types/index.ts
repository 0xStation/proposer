import * as z from "zod"

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

export enum FundingSenderType {
  CHECKBOOK = "CHECKBOOK",
  SAFE = "SAFE",
  WALLET = "WALLET",
}

export const Token = z.object({
  chainId: z.number(),
  address: z.string(),
  symbol: z.string(),
  decimals: z.number(),
})
