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
  DAILY_COMMUTER = "DLY COMMUTER",
  WEEKEND_COMMUTER = "WKND COMMUTER",
  VISITOR = "VISITOR",
}
