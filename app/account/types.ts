import { AccountProposal, AddressType } from "@prisma/client"

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
  hasSavedEmail?: boolean
  hasVerifiedEmail?: boolean
  // for smart contract Accounts (e.g. multisigs), indicate the chainId of the smart contract
  chainId?: number
}

export type Account = {
  id: number
  address?: string
  discordId?: string
  addressType?: AddressType
  data: AccountMetadata
  role?: string
  points?: number
  joinedAt?: Date
  skills?: any[]
  tickets?: any[]
  initiatives?: any[]
  proposals?: AccountProposal[]
}
