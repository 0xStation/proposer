import { Role } from "app/role/types"

export enum MethodToVisualizeContributorsNFT {
  ROLE = "ROLE", // images are created per role, e.g. CCS NFT
  INDIVIDUAL = "INDIVIDUAL", // images are generated per individual, e.g. Station NFT
}

export type TerminalMetadata = {
  name: string
  description: string
  pfpURL: string
  coverURL?: string
  permissions: {
    invite: any
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
  metadata?: {
    imageConfig: {
      logicType: string
      roleMap?: Record<number, string> // maps from Role localId's to a URL, only used if logicType is ROLE
    }
  }
}

export type Terminal = {
  id: number
  ticketAddress: string
  handle: string
  data: TerminalMetadata
  roles: Role[]
}
