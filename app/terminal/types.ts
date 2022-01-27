export type TerminalMetadata = {
  name: string
  handle: string
  description: string
  pfpURL: string
}

export type Terminal = {
  id: number
  ticketAddress: string
  handle: string
  data: TerminalMetadata
}
