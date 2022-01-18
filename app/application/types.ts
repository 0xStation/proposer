import { Account } from "app/account/types"
import { Initiative } from "app/initiative/types"

export type Application = {
  id: number
  applicant: Account
  applicantId: number
  initiative: Initiative
  initiativeId: number
  data: object
}
