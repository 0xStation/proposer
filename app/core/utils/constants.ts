import { chain } from "wagmi"
import { RfpStatus } from "app/rfp/types"
import { ProposalStatus as ProductProposalStatus } from "app/proposal/types"
import networks from "app/utils/networks.json"
import { ProposalRoleType, ProposalNewStatus } from "@prisma/client"
import { PaymentTerm } from "app/proposalPayment/types"
import Gradient0 from "/public/gradients/0.png"
import Gradient1 from "/public/gradients/1.png"
import Gradient2 from "/public/gradients/2.png"
import Gradient3 from "/public/gradients/3.png"
import Gradient4 from "/public/gradients/4.png"
import Gradient5 from "/public/gradients/5.png"

export const gradientMap = {
  0: Gradient0,
  1: Gradient1,
  2: Gradient2,
  3: Gradient3,
  4: Gradient4,
  5: Gradient5,
}

export const CONTRACTS = {
  // Localhost, change to whatever the forge script outputs when running local anvil
  1337: {
    CHECKBOOK_TEMPLATE: "0x6c8D53600C7f8F97ed32e6162867F3340dE3Ab37",
    CHECKBOOK_FACTORY: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  },
  // Rinkeby
  4: {
    CHECKBOOK_TEMPLATE: "0xE6D65486A937625463549438be9Ad4BA294Ba529",
    CHECKBOOK_FACTORY: "0xD97Bb632B2f2867e61F80F92a9915ca2fE70eC09",
  },
  // Goerli
  5: {
    CHECKBOOK_TEMPLATE: "0x0dab51c6d469001d31ffde15db9e539d8bac4125",
    CHECKBOOK_FACTORY: "0x99f3609d447046ab72d60312cf6d4e36069afba3",
  },
  // Mainnet
  1: {
    CHECKBOOK_TEMPLATE: "0x1e6915c91de98a01c78033b8abc69256beb8e88d",
    CHECKBOOK_FACTORY: "0x48c0c83f7ff34927c7a74aa5fad15d95f34e6eb0",
  },
}

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

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
    copy: "open for submissions soon",
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

export const PROPOSAL_NEW_STATUS_DISPLAY_MAP = {
  [ProposalNewStatus.DRAFT]: {
    copy: "draft",
    color: "bg-concrete",
  },
  [ProposalNewStatus.AWAITING_APPROVAL]: {
    copy: "awaiting approval",
    color: "bg-neon-carrot",
  },
  [ProposalNewStatus.APPROVED]: {
    copy: "signed",
    color: "bg-magic-mint",
  },
  [ProposalNewStatus.COMPLETE]: {
    copy: "complete",
    color: "bg-marble-white",
  },
}

export const PROPOSAL_STATUS_DISPLAY_MAP = {
  [ProductProposalStatus.SUBMITTED]: {
    copy: "submitted",
    color: "bg-marble-white",
  },
  [ProductProposalStatus.IN_REVIEW]: {
    copy: "in review",
    color: "bg-neon-carrot",
  },
  [ProductProposalStatus.APPROVED]: {
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
  ProductProposalStatus.SUBMITTED,
  ProductProposalStatus.IN_REVIEW,
  ProductProposalStatus.APPROVED,
]

export const PROPOSAL_NEW_STATUS_FILTER_OPTIONS = [
  ProposalNewStatus.APPROVED,
  ProposalNewStatus.AWAITING_APPROVAL,
  ProposalNewStatus.DRAFT,
  ProposalNewStatus.COMPLETE,
]

export const PROPOSAL_ROLE_FILTER_OPTIONS = [
  ProposalRoleType.AUTHOR,
  ProposalRoleType.CLIENT,
  ProposalRoleType.CONTRIBUTOR,
]

export const SENDGRID_TEMPLATES = {
  NEW_PROPOSAL: "d-a73399b0868b4dbaae6dbff04b887f53",
  APPROVED_PROPOSAL: "d-1e84326048464c8c8277949bfde770fe",
  VERIFY: "d-9e113acf1a9f4830beaf3aa3553f9fde",
}

export const getStablecoinMetadataBySymbol = ({ chain = 1, symbol = "USDC" }) => {
  return networks[chain as number]?.stablecoins.find((stablecoin) => stablecoin.symbol === symbol)
}

export const EVENT_TYPE = {
  CLICK: "click",
  IMPRESSION: "impression",
  EVENT: "event",
  ERROR: "error",
}

export const TRACKING_EVENTS = {
  PAGE_NAME: {
    PROFILE_NAV: "profile_nav",
    EXPLORE: "explore",
    STATION_CREATION_PAGE: "station_creation_page",
    COMPLETE_PROFILE_PAGE: "complete_profile_checkbook_page",
    COMPLETE_PROFILE_CHECKBOOK_PAGE: "complete_profile_checkbook_page",
    CHECKBOOK_CREATE_SETTINGS_PAGE: "checkbook_create_settings_page",
    CHECKBOOK_SETTINGS_PAGE: "checkbook_settings_page",
    RFP_LIST_PAGE: "rfp_list_page",
    RFP_INFO_PAGE: "rfp_info_page",
    RFP_PROPOSALS_PAGE: "rfp_proposals_page",
    RFP_EDITOR_PAGE: "rfp_editor_page",
    PROPOSAL_INFO_PAGE: "proposal_info_page",
    PROPOSAL_EDITOR_PAGE: "proposal_editor_page",
  },
  FEATURE: {
    CHECKBOOK: {
      EVENT_NAME: {
        COMPLETE_PROFILE_CHECKBOOK_EXIT_CLICKED: "complete_profile_checkbook_exit_clicked",
        CREATE_CHECKBOOK_PAGE_SHOWN: "checkbook_create_page_shown",
        CHECKBOOK_SETTINGS_PAGE_SHOWN: "checkbook_settings_page_shown",
        CHECKBOOK_SHOW_CREATE_PAGE_CLICKED: "checkbook_show_create_page_clicked",
        CHECKBOOK_CREATE_BUTTON_CLICKED: "checkbook_create_button_clicked",
        CHECKBOOK_CONTRACT_CREATED: "checkbook_contract_created",
        CHECKBOOK_MODEL_CREATED: "checkbook_model_created",
        CHECKBOOK_CREATE_ERROR: "checkbook_create_error",
        CHECKBOOK_ADD_FUNDS_CLICKED: "checkbook_add_funds_clicked",
      },
    },
    RFP: {
      EVENT_NAME: {
        RFP_LIST_PAGE_SHOWN: "rfp_list_page_shown",
        RFP_SHOW_EDITOR_CLICKED: "rfp_show_editor_clicked",
        RFP_EDITOR_PAGE_SHOWN: "rfp_editor_page_shown",
        RFP_EDITOR_PUBLISH_CLICKED: "rfp_editor_publish_clicked",
        RFP_EDITOR_MODAL_PUBLISH_CLICKED: "rfp_editor_modal_publish_clicked",
        RFP_CREATED: "rfp_created",
        RFP_EDITED: "rfp_edited",
        ERROR_CREATING_RFP: "error_creating_rfp",
        ERROR_EDITING_RFP: "error_editing_rfp",
        RFP_SETTINGS_CLOSE_RFP_CLICKED: "rfp_settings_close_rfp_clicked",
        CLOSE_RFP_CLICKED: "close_rfp_clicked",
        ERROR_CLOSING_RFP: "error_closing_rfp",
        RFP_SETTINGS_REOPEN_RFP_CLICKED: "rfp_settings_reopen_rfp_clicked",
        REOPEN_RFP_CLICKED: "reopen_rfp_clicked",
        ERROR_REOPENING_RFP: "error_reopening_rfp",
        RFP_SETTINGS_DELETE_RFP_CLICKED: "rfp_settings_delete_rfp_clicked",
        DELETE_RFP_CLICKED: "delete_rfp_clicked",
        ERROR_DELETING_RFP: "error_deleting_rfp",
        RFP_INFO_PAGE_SHOWN: "rfp_info_page_shown",
        RFP_PROPOSALS_PAGE_SHOWN: "rfp_proposals_page_shown",
      },
    },
    PROPOSAL: {
      EVENT_NAME: {
        PROPOSAL_INFO_PAGE_SHOWN: "proposal_info_page_shown",
        PROPSOAL_EDITOR_PAGE_SHOWN: "proposal_editor_page_shown",
        PROPOSAL_SHOW_EDITOR_CLICKED: "proposal_show_editor_clicked",
        PROPOSAL_EDITOR_PUBLISH_CLICKED: "proposal_editor_publish_clicked",
        PROPOSAL_EDITOR_MODAL_PUBLISH_CLICKED: "proposal_editor_modal_publish_clicked",
        ERROR_CREATING_PROPOSAL: "error_creating_proposal",
        ERROR_EDITING_PROPOSAL: "error_deleting_proposal",
        ERROR_DELETING_PROPOSAL: "error_deleting_proposal",
        PROPOSAL_SETTINGS_DELETE_PROPOSAL_CLICKED: "proposal_settings_delete_proposal_clicked",
        DELETE_PROPOSAL_CLICKED: "delete_proposal_clicked",
      },
    },
    NEW_STATION: {
      EVENT_NAME: {
        SHOW_CREATE_STATION_PAGE_CLICKED: "show_create_station_page_clicked",
        CREATE_STATION_PAGE_SHOWN: "create_station_page_shown",
        CREATE_STATION_BACK_BUTTON_CLICKED: "create_station_back_button_clicked",
        CREATE_STATION_CREATE_CONTINUTE_CLICKED: "create_station_create_continue_clicked",
        ERROR_CREATING_STATION: "error_creating_station",
      },
    },
    WALLET_CONNECTION: {
      EVENT_NAME: {
        WALLET_CONNECTION_BANNER_CLICKED: "wallet_connection_banner_clicked",
        WALLET_CONNECTION_BUTTON_CLICKED: "wallet_connection_button_clicked",
        WALLET_CONNECTION_ERROR: "wallet_connection_error",
        SIGN_IN_WITH_ETHEREUM_BUTTON_CLICKED: "sign_in_with_ethereum_button_clicked",
        SIGN_IN_WITH_ETHEREUM_ERROR: "sign_in_with_ethereum_error",
        WALLET_DISCONNECT_CLICKED: "wallet_disconnect_clicked",
      },
    },
  },
}

export const TOKEN_SYMBOLS = {
  ETH: "ETH",
  USDC: "USDC",
}

export const LINKS = {
  CHECKBOOK:
    "https://station-labs.gitbook.io/station-product-manual/for-daos-communities/checkbook",
  PRODUCT_MANUAL: "https://station-labs.gitbook.io/station-product-manual/",
  HELP_DESK: "https://6vdcjqzyfj3.typeform.com/to/F0QFs9aC",
  NEWSTAND: "https://station.mirror.xyz/",
  LEGAL: "https://www.notion.so/0xstation/Legal-Privacy-a3b8da1a13034d1eb5f81482ec637176",
  TYPEFORM_WAITLIST: "https://6vdcjqzyfj3.typeform.com/to/G3LN1FlM",
  PINATA_BASE_URL: "https://station.mypinata.cloud/ipfs/", // TODO: change Station gateway domain
  MARKDOWN_GUIDE:
    "https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax",
  STATION_WORKSPACES:
    "https://0xstation.notion.site/0xstation/Station-Workspaces-8c696d92fdbd4dc0b2c7e67efc54a9a5",
}

export const CHAIN_IDS = {
  ETHEREUM: 1,
  RINKEBY: 4,
  GOERLI: 5,
  OPTIMISM: 10,
  POLYGON: 137,
}

export const SUPPORTED_CHAINS = [
  chain.mainnet,
  chain.rinkeby,
  chain.goerli,
  chain.optimism,
  chain.polygon,
]

export const SUPPORTED_CHAIN_IDS = SUPPORTED_CHAINS.map((chain) => chain.id)

export enum Sizes {
  SM = "SM",
  BASE = "BASE",
  LG = "LG",
}

export enum FeatureFlagStatus {
  ON = "ON",
  OFF = "OFF",
}

export const FEATURE_FLAG_KEYS = {
  MEMBER_DIRECTORY: "member_directory",
}

export const PAYMENT_TERM_MAP = {
  [PaymentTerm.ON_AGREEMENT]: {
    copy: "Pay on proposal agreement",
  },
  [PaymentTerm.AFTER_COMPLETION]: {
    copy: "Pay after proposal completion",
  },
}

export const txPathString = "/tx/"

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
