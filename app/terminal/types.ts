export type TerminalMetadata = {
  name: string
  description: string
  pfpURL: string
  permissions: {
    invite: {
      rolesAllowedToInvite: number[]
    }
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
}

export type Terminal = {
  id: number
  ticketAddress: string
  handle: string
  data: TerminalMetadata
}
