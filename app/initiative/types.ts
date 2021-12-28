import { ExternalLink } from "app/types"

export type InitiativeMetadata = {
  name: string
  description: string
  shortName: string
  bannerURL?: string
  contributeText?: string
  rewardText?: string
  isAcceptingApplications: boolean
  links: ExternalLink[]
}
