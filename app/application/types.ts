import { Account } from "app/account/types"
import { Initiative } from "app/initiative/types"
export type ApplicationMetaData = {
  skills?: string[]
  contact?: string
  timezone?: string
  why?: string
  submission?: string[]
  // endorsements?: Account[]
}
export type Application = {
  id: number
  applicant: Account
  applicantId: number
  initiative: Initiative
  initiativeId: number
  data: ApplicationMetaData
  endorsements: Account[]
}
