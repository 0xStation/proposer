import { Role } from "../types"
export type Ticket = {
  accountId: number
  terminalId: number
  roleLocalId: number
  joinedAt: Date
  active: boolean
  data?: TicketMetadata
  role?: Role
}

export type TicketMetadata = {
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
  DATE = "date",
}
