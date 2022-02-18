export type TerminalMetadata = {
  name: string
  description: string
  pfpURL: string
  permissions: {
    invite: number[] // list of role local ids
  }
}

export type Terminal = {
  id: number
  ticketAddress: string
  handle: string
  data: TerminalMetadata
}
