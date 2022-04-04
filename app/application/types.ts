import { Account } from "app/account/types"

export type ApplicationMetadata = {
  entryDescription?: string
  url?: string
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

export type ApplicationStatus = "INTERESTED" | "CONTRIBUTING" | "PREVIOUS_CONTRIBUTOR"

export type ApplicationSubgraphData = {
  points: number
  referrals: ApplicationReferral[]
}
