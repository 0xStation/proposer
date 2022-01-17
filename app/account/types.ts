export type AccountMetadata = {
  name: string
  handle: string
  wallet?: string
  ticketId?: number // TODO: remove this when subgraph is ready
  pfpURL?: string
  webURL?: string
  githubURL?: string
  twitterURL?: string
  skills: string[]
  pronouns: string
  discordId: string
  timezone: string
  verified: boolean
  role?: string
  applications?: number[]
}

export type Account = {
  id: number
  address: string
  data: AccountMetadata
}
