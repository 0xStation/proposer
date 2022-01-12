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
  discord: string
  verified: boolean
  role?: string
  ticketImage?: string
}

export type Account = {
  id: number
  address: string
  data: AccountMetadata
}
