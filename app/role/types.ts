export type RoleMetadata = {
  name: string
  value: string
}

export type Role = {
  terminalId: number
  localId: number
  data: RoleMetadata
  ticketCount?: number
}
