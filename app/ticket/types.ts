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

export type TicketMetaData = {
  ticketImageUrl: string
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
