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
  applicant: Account
  points: number
  referrals: ApplicationReferral[]
}