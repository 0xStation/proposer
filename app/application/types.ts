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
  endorsements: Account[] // this data field is here just for visualizing dummy data while designing waiting room
  createdAt: Date
}
