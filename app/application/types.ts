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

export type ApplicationStatus = "APPLIED" | "INVITED" | "CONTRIBUTOR" | "INACTIVE"

export type ApplicationSubgraphData = {
  points: number
  referrals: ApplicationReferral[]
}
