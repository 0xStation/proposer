import { ExternalLink } from "app/types"
import { Skill } from "app/skills/types"

export type CustomElement = { type: "paragraph"; children: CustomText[] }
export type CustomText = { text: string }

export type InitiativeMetadata = {
  about: CustomElement[]
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
  status?: string
  applicationQuestion?: string
}

export type Initiative = {
  id: number
  terminalId: number
  localId: number
  data: InitiativeMetadata
  skills: Skill[]
  contributors?: []
  applicationCount?: number
}
