import { RfpStatus } from "app/rfp/types"
import { ProposalStatus } from "app/proposal/types"

export const CONTRACTS = {
  // Localhost, change to whatever the forge script outputs when running local anvil
  1337: {
    CHECKBOOK_TEMPLATE: "0x6c8D53600C7f8F97ed32e6162867F3340dE3Ab37",
    CHECKBOOK_FACTORY: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  },
  // Rinkeby, don't change
  4: {
    CHECKBOOK_TEMPLATE: "0xF906C63090984B4Fb9038C352cAd199f202bf0b2",
    CHECKBOOK_FACTORY: "0x5713fDC78EE84bA17D8e629b945FAb03F172f8E7",
  },
}

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

export const CHAIN_IDS = {
  ETHEREUM: 1,
  RINKEBY: 4,
  GOERLI: 5,
}

export const DEFAULT_PFP_URLS = {
  USER: "https://station-images.nyc3.digitaloceanspaces.com/pfp-gradient.png",
  TERMINAL: "https://station-images.nyc3.digitaloceanspaces.com/terminal-gradient.png",
}

export const RFP_STATUS_DISPLAY_MAP = {
  [RfpStatus.DRAFT]: {
    copy: "draft",
    color: "bg-concrete",
  },
  [RfpStatus.STARTING_SOON]: {
    copy: "starting soon",
    color: "bg-neon-carrot",
  },
  [RfpStatus.OPEN_FOR_SUBMISSIONS]: {
    copy: "open for submissions",
    color: "bg-magic-mint",
  },
  [RfpStatus.CLOSED]: {
    copy: "closed",
    color: "bg-torch-red",
  },
}

export const PROPOSAL_STATUS_DISPLAY_MAP = {
  [ProposalStatus.SUBMITTED]: {
    copy: "submitted",
    color: "bg-marble-white",
  },
  [ProposalStatus.IN_REVIEW]: {
    copy: "in review",
    color: "bg-neon-carrot",
  },
  [ProposalStatus.APPROVED]: {
    copy: "approved",
    color: "bg-magic-mint",
  },
}

export const PAGINATION_TAKE = 50

export const RFP_STATUSES_FILTER_OPTIONS = [
  RfpStatus.STARTING_SOON,
  RfpStatus.OPEN_FOR_SUBMISSIONS,
  RfpStatus.CLOSED,
]

export const PROPOSAL_STATUSES_FILTER_OPTIONS = [
  ProposalStatus.SUBMITTED,
  ProposalStatus.IN_REVIEW,
  ProposalStatus.APPROVED,
]

export const SENDGRID_TEMPLATES = {
  NEW_PROPOSAL: "d-a73399b0868b4dbaae6dbff04b887f53",
  APPROVED_PROPOSAL: "d-1e84326048464c8c8277949bfde770fe",
}

// LEGACY BELOW

// LEGACY
export enum AccountInitiativeStatus {
  INTERESTED = "INTERESTED",
  CONTRIBUTING = "CONTRIBUTING",
  PREVIOUSLY_CONTRIBUTED = "PREVIOUSLY_CONTRIBUTED",
}
// LEGACY
export const defaultTicketImageUrl: string =
  "https://station-images.nyc3.digitaloceanspaces.com/e0ed554e-b0b7-4e03-90f4-221708b159e0.svg"

// THIS IS THE LEGACY SECTION
