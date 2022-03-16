export type Ticket = {
  accountId: number
  terminalId: number
  roleLocalId: number
  joinedAt: Date
  active: boolean
}

export enum TraitTypes {
  STATUS = "STATUS",
  ROLE = "ROLE",
  INITIATIVE = "INITIATIVE",
  GUILD = "GUILD",
  JOINED_SINCE = "JOINED_SINCE",
}

export enum DisplayTypes {
  LABEL = "label",
  DATE = "date",
}
