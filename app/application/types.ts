import { Account } from "app/account/types"

export type ApplicationMetadata = {
  entryDescription?: string
  url?: string
  urls?: string[]
}

export type ApplicationReferral = {
  from: Account
  amount: number
}

export type Application = {
  createdAt: Date
  data: ApplicationMetadata
  account: Account
  points: number
  referrals: ApplicationReferral[]
}

export type ApplicationStatus = "INTERESTED" | "CONTRIBUTING" | "PREVIOUSLY_CONTRIBUTED"

export type ApplicationSubgraphData = {
  points: number
  referrals: ApplicationReferral[]
}
