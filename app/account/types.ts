import { AccountProposal } from "@prisma/client"

export type AccountMetadata = {
  name: string
  handle?: string
  ens?: string
  ticketId?: number // TODO: remove this when subgraph is ready
  pfpURL?: string
  githubUrl?: string
  twitterUrl?: string
  tiktokUrl?: string
  instagramUrl?: string
  ticketImage?: string
  pronouns?: string
  discordId?: string
  contactURL?: string
  coverURL?: string
  timezone?: string
  verified?: boolean
  bio?: string
  initiatives?: number[]
}

export type Account = {
  id: number
  address?: string
  discordId?: string
  data: AccountMetadata
  role?: string
  points?: number
  joinedAt?: Date
  skills?: any[]
  tickets?: any[]
  initiatives?: any[]
  proposals?: AccountProposal[]
}
