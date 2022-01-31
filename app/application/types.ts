import { Account } from "app/account/types"
export type ApplicationMetaData = {
  entryDescription?: string
  url?: string
}

export type Referral = {
  from: Account
  amount: number
}

export type Application = {
  createdAt: Date
  data: ApplicationMetaData
  applicant: Account
  points: number
  referrals: Referral[]
}
