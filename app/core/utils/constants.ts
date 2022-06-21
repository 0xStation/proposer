import { RfpStatus } from "app/rfp/types"
import { ProposalStatus } from "app/proposal/types"

export const CONTRACTS = {
  // Localhost, change to whatever the forge script outputs when running local anvil
  1337: {
    CHECKBOOK: "0x6c8D53600C7f8F97ed32e6162867F3340dE3Ab37",
    CHECKBOOK_FACTORY: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  },
  // Rinkeby, don't change
  4: {
    CHECKBOOK: "0x6c8D53600C7f8F97ed32e6162867F3340dE3Ab37",
    CHECKBOOK_FACTORY: "0x6c8D53600C7f8F97ed32e6162867F3340dE3Ab37",
  },
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
    copy: "open for submissions",
    color: "bg-torch-red",
  },
}

export const PROPOSAL_STATUS_DISPLAY_MAP = {
  [ProposalStatus.APPROVED]: {
    copy: "approved",
    color: "bg-magic-mint",
  },
  [ProposalStatus.IN_REVIEW]: {
    copy: "in review",
    color: "bg-neon-carrot",
  },
}

// legacy below

export enum AccountInitiativeStatus {
  INTERESTED = "INTERESTED",
  CONTRIBUTING = "CONTRIBUTING",
  PREVIOUSLY_CONTRIBUTED = "PREVIOUSLY_CONTRIBUTED",
}

export const defaultTicketImageUrl: string =
  "https://station-images.nyc3.digitaloceanspaces.com/e0ed554e-b0b7-4e03-90f4-221708b159e0.svg"
