import { Account } from "app/account/types"

export type EndorsementMetadata = {
  endorsementValue: number
  // endorsement value may be different than points value if we apply multipliers:
  // eg: contributors who have a role type of staff have a weight of 3x when they endorse
  // compared to contributors who have a role type of visitor.
  pointsValue: number
}

export type Endorsement = {
  id: number
  initiativeId: number
  endorserId: number
  endorseeId: number
  endorser: Account
  endorsee: Account
  timestamp: Date
  data: EndorsementMetadata
}
