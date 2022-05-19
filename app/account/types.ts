import { Skill } from "app/skills/types"

export type AccountMetadata = {
  name: string
  handle?: string
  ens?: string
  bio?: string
  ticketId?: number // TODO: remove this when subgraph is ready
  pfpURL?: string
  coverURL?: string
  contactURL?: string
  githubUrl?: string
  twitterUrL?: string
  tiktokUrl?: string
  instagramUrl?: string
  ticketImage?: string
  pronouns?: string
  discordId?: string
  timezone?: string
  verified?: boolean
  initiatives?: number[]
}

export type Account = {
  id: number
  address: string
  data: AccountMetadata
  role?: string
  points?: number
  joinedAt?: Date
  skills?: any[]
  tickets?: any[]
  initiatives?: any[]
}
