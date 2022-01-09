import { ExternalLink } from "app/types"

export type InitiativeMetadata = {
  name: string
  description: string
  shortName: string
  bannerURL?: string
  contributeText?: string[]
  rewardText?: string
  isAcceptingApplications: boolean
  links: ExternalLink[]
  members?: string[]
}

export type Initiative = {
  id: number
  terminalId: number
  terminalTicket: string
  localId: number
  data: InitiativeMetadata
}
