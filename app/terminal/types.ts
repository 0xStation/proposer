import { Initiative } from "app/deprecated/v1/initiative/types"
import { Role } from "app/role/types"
import { Tag } from "app/tag/types"

export enum MethodToVisualizeContributorsNft {
  ROLE = "ROLE", // images are created per role, e.g. CCS NFT
  INDIVIDUAL = "INDIVIDUAL", // images are generated per individual, e.g. Station NFT
}

export type TerminalMetadata = {
  name: string
  description: string
  pfpURL: string
  guildId?: string

  // v1
  coverURL?: string
  permissions: {
    invite: Record<string, number[]>
    edit: Record<string, number[]>
    accountWhitelist?: string[]
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
  hide?: boolean
  discordWebhookUrl?: string
  visualizeNftMethod?: string
}

export type Terminal = {
  id: number
  handle: string
  data: TerminalMetadata
  tags: Tag[]

  // v1
  ticketAddress: string
  roles: Role[]
  initiatives?: Initiative[]
}
