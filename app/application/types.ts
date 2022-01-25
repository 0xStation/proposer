import { Account } from "app/account/types"
import { Initiative } from "app/initiative/types"
export type ApplicationMetaData = {
  why?: string
  url?: string
}
export type Application = {
  id: number
  applicant: Account
  applicantId: number
  initiative: Initiative
  initiativeId: number
  data: ApplicationMetaData
  endorsements: Account[] // this data field is here just for visualizing dummy data while designing waiting room
}
