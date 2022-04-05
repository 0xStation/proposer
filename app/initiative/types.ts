import { ExternalLink } from "app/types"
import { Skill } from "app/skills/types"

export type CustomElement = { type: "paragraph"; children: CustomText[] }
export type CustomText = { text: string }

export type InitiativeMetadata = {
  about: CustomElement[]
  name: string
  oneLiner?: string
  bannerURL?: string
  rewardText?: string[]
  isAcceptingApplications: boolean
  links: ExternalLink[]
  link?: string
  members?: string[]
  commitment?: string
  skills?: string[]
  status: string
  contributeText?: string[]
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

export enum StatusOptions {
  OPEN_FOR_SUBMISSIONS = "OPEN FOR SUBMISSIONS",
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}
