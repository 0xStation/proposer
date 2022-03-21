import { ExternalLink } from "app/types"
import { InitiativeSkill } from "app/skills/types"

export type InitiativeMetadata = {
  name: string
  oneLiner?: string
  bannerURL?: string
  contributeText?: string[]
  rewardText?: string[]
  isAcceptingApplications: boolean
  links: ExternalLink[]
  members?: string[]
  commitment?: string
  skills?: string[]
  applicationQuestion?: string
}

export type Initiative = {
  id: number
  terminalId: number
  localId: number
  data: InitiativeMetadata
  contributors?: []
  skills: InitiativeSkill[]
  applicationCount?: number
}
