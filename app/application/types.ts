import { Account } from "app/account/types"
import { Initiative } from "app/initiative/types"
export type ApplicationMetadata = {
  entryDescription?: string
  url?: string
}
export type Application = {
  id: number
  applicant: Account
  applicantId: number
  initiative: Initiative
  initiativeId: number
  points: number
  data: ApplicationMetadata
  createdAt: Date
  referrals: ApplicationReferral[]
}
export type ApplicationReferral = {
  from: Account
  amount: number
}
