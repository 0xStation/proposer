export type Ticket = {
  accountId: number
  terminalId: number
  roleLocalId: number
  joinedAt: Date
  active: boolean
  data?: TicketMetadata
}

export type TicketMetadata = {
  ticketImageUrl: string
}

export enum TraitTypes {
  STATUS = "STATUS",
  ROLE = "ROLE",
  INITIATIVE = "INITIATIVE",
  GUILD = "GUILD",
  JOINED_SINCE = "JOINED SINCE",
}

export enum DisplayTypes {
  DATE = "date",
}
