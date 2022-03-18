import { AccountTerminal } from "@prisma/client"

export type RoleMetadata = {
  name: string
  value: string
  imageUrl?: string
}

export type Role = {
  terminalId: number
  localId: number
  data: RoleMetadata
  ticketCount?: number
  tickets?: AccountTerminal
}
