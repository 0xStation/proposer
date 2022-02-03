export type AccountMetadata = {
  name: string
  handle?: string
  ens?: string
  ticketId?: number // TODO: remove this when subgraph is ready
  pfpURL?: string
  webURL?: string
  githubURL?: string
  twitterURL?: string
  ticketImage?: string
  pronouns?: string
  discordId: string
  timezone: string
  verified: boolean
  initiatives?: number[]
}

export type Account = {
  id: number
  address: string
  data: AccountMetadata
  role?: string
  points?: number
  joinedAt?: Date
  skills: string[]
  initiatives?: any[]
}
