export type Ticket = {
  accountId: number
  terminalId: number
  roleLocalId: number
  joinedAt: Date
  active: boolean
  data: TicketMetaData
}

export type TicketMetaData = {
  ticketImageUrl: string
}
