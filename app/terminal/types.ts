import { Initiative } from "app/deprecated/v1/initiative/types"
import { Role } from "app/role/types"
import { Tag } from "app/tag/types"
import { Checkbook } from "app/checkbook/types"

export enum MethodToVisualizeContributorsNft {
  ROLE = "ROLE", // images are created per role, e.g. CCS NFT
  INDIVIDUAL = "INDIVIDUAL", // images are generated per individual, e.g. Station NFT
}

export type TerminalMetadata = {
  name: string
  description: string
  pfpURL: string
  guildId?: string
  permissions: {
    accountWhitelist?: string[] // provides `isAdmin` access based on specific addresses
    adminTagIdWhitelist?: number[] // `isAdmin` provides access to all subpages within Station settings

    // v1
    invite: Record<string, number[]>
    edit: Record<string, number[]>
  }

  // v1
  coverURL?: string
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
  checkbooks?: Checkbook[]

  // v1
  ticketAddress: string
  roles: Role[]
  initiatives?: Initiative[]
}
