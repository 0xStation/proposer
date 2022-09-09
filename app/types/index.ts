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
