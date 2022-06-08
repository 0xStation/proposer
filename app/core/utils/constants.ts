export const TERMINAL = {
  TICKET_ADDRESS: "0xd9243de6be84EA0f592D20e3E6bd67949D96bfe9",
  TOKEN_ADDRESS: "0xABf03EDC17De11e80008C3e89919b82AbA34521A",
  GRAPH_ADDRESS: "0x95FF4aA92976918e9321c5028A48F7cd381314F8",
  REFERRAL_GRAPH: "0x488d547e5C383d66815c67fB1356A3F35d3885CF",
}

export const CONTRACTS = {
  WAITING_ROOM: "0x20609FDe04cCaDC162A618E2BC667De4a76C7DF0",
}

export const DEFAULT_NUMBER_OF_DECIMALS = 6

export const MAX_ALLOWANCE = 100000000000000

export const APPLICATION_STATUS_MAP = {
  PREVIOUSLY_CONTRIBUTED: {
    status: "PREVIOUSLY CONTRIBUTED",
    color: "bg-torch-red",
  },
  INTERESTED: {
    status: "INTERESTED",
    color: "bg-neon-blue",
  },
  CONTRIBUTING: {
    status: "CONTRIBUTING",
    color: "bg-magic-mint",
  },
}

export enum EditPermissionTypes {
  INITIATIVE = "initiative",
  TERMINAL = "terminal",
}

export enum AccountInitiativeStatus {
  INTERESTED = "INTERESTED",
  CONTRIBUTING = "CONTRIBUTING",
  PREVIOUSLY_CONTRIBUTED = "PREVIOUSLY_CONTRIBUTED",
}

export const defaultTicketImageUrl: string =
  "https://station-images.nyc3.digitaloceanspaces.com/e0ed554e-b0b7-4e03-90f4-221708b159e0.svg"

export const QUERY_PARAMETERS = {
  DIRECTED_FROM: {
    SUBMITTED_APPLICATION: "submitted_application",
    PROFILE: "profile",
    INITIATIVE_BOARD: "initiative-board",
  },
  SET_TAB: {
    INITIATIVES: "initiatives",
    TERMINALS: "terminals",
  },
}

export const PROFILE_TABS = {
  INITIATIVES: "INITIATIVES",
  TERMINALS: "TERMINALS",
}

export const DEFAULT_PFP_URLS = {
  USER: "https://station-images.nyc3.digitaloceanspaces.com/pfp-gradient.png",
  TERMINAL: "https://station-images.nyc3.digitaloceanspaces.com/terminal-gradient.png",
}
