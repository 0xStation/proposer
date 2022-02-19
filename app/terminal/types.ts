export type TerminalMetadata = {
  name: string
  description: string
  pfpURL: string
  permissions: {
    invite: {
      rolesAllowedToInvite: number[]
    }
  }
}

export type Terminal = {
  id: number
  ticketAddress: string
  handle: string
  data: TerminalMetadata
}
