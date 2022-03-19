import { Role } from "app/role/types"

export type TerminalMetadata = {
  name: string
  description: string
  pfpURL: string
  coverURL?: string
  permissions: {
    invite: any
  }
  contracts: {
    addresses: {
      endorsements: string
      points: string
      referrals: string
    }
    symbols: {
      endorsements: string
      points: string
      referrals: string
    }
  }
  hide?: boolean
  discordWebhookUrl?: string
}

export type Terminal = {
  id: number
  ticketAddress: string
  handle: string
  data: TerminalMetadata
  roles: Role[]
}
