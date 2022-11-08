import { chain } from "wagmi"
import networks from "app/utils/networks.json"
import {
  ProposalRoleType,
  ProposalStatus,
  ProposalRoleApprovalStatus,
  RfpStatus,
} from "@prisma/client"
import { PaymentTerm } from "app/proposalPayment/types"
import { ProposalMilestoneStatus } from "app/proposalMilestone/types"
import { getNetworkCoin, getNetworkUsdc } from "./networkInfo"
import {
  RESERVED_KEYS,
  ProposalTemplateFieldType,
  ProposalTemplateFieldValidationName,
} from "app/template/types"
import { PaymentDirection } from "app/rfp/types"
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

export enum ProposalFormStep {
  PROPOSE = "PROPOSE",
  REWARDS = "REWARDS",
  CONFIRM = "CONFIRM",
}

export const PROPOSAL_FORM_HEADER_COPY = {
  [ProposalFormStep.PROPOSE]: "Propose",
  [ProposalFormStep.REWARDS]: "Define terms",
  [ProposalFormStep.CONFIRM]: "Confirm",
}

export enum RfpFormStep {
  RFP = "RFP",
  PAYMENT = "PAYMENT",
  PERMISSIONS = "PERMISSIONS",
}

export const RFP_FORM_HEADER_COPY = {
  [RfpFormStep.RFP]: "RFP",
  [RfpFormStep.PAYMENT]: "Payment",
  [RfpFormStep.PERMISSIONS]: "Permissions",
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

export const PROPOSAL_NEW_STATUS_DISPLAY_MAP = {
  [ProposalStatus.DRAFT]: {
    copy: "draft",
    color: "bg-concrete",
  },
  [ProposalStatus.AWAITING_APPROVAL]: {
    copy: "awaiting approval",
    color: "bg-neon-carrot",
  },
  [ProposalStatus.APPROVED]: {
    copy: "approved",
    color: "bg-magic-mint",
  },
  [ProposalStatus.COMPLETE]: {
    copy: "complete",
    color: "bg-neon-blue",
  },
}

export const RFP_STATUS_DISPLAY_MAP = {
  [RfpStatus.OPEN]: {
    copy: "open",
    color: "bg-magic-mint",
  },
  [RfpStatus.CLOSED]: {
    copy: "closed",
    color: "bg-concrete",
  },
}

export const PROPOSAL_ROLE_APPROVAL_STATUS_MAP = {
  [ProposalRoleApprovalStatus.PENDING]: {
    copy: "pending",
    color: "bg-neon-carrot",
  },
  [ProposalRoleApprovalStatus.APPROVED]: {
    copy: "approved",
    color: "bg-magic-mint",
  },
  [ProposalRoleApprovalStatus.SENT]: {
    copy: "sent",
    color: "bg-magic-mint",
  },
}

export const PROPOSAL_MILESTONE_STATUS_MAP = {
  [ProposalMilestoneStatus.SCHEDULED]: {
    copy: "scheduled",
    color: "bg-concrete",
  },
  [ProposalMilestoneStatus.IN_PROGRESS]: {
    copy: "pending",
    color: "bg-neon-carrot",
  },
  [ProposalMilestoneStatus.COMPLETE]: {
    copy: "paid",
    color: "bg-magic-mint",
  },
}

export const PAGINATION_TAKE = 50

export const PROPOSAL_NEW_STATUS_FILTER_OPTIONS = [
  ProposalStatus.APPROVED,
  ProposalStatus.AWAITING_APPROVAL,
  // ProposalStatus.DRAFT, // DRAFT currently pertains to an unsigned proposal - we're making a decision to hide this from view
  ProposalStatus.COMPLETE,
]

export const PROPOSAL_ROLE_FILTER_OPTIONS = [
  ProposalRoleType.AUTHOR,
  ProposalRoleType.CLIENT,
  ProposalRoleType.CONTRIBUTOR,
]

export const RFP_STATUS_FILTER_OPTIONS = [RfpStatus.OPEN, RfpStatus.CLOSED]

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
  STATION_WORKSPACES: "https://www.station.express/tools/directory",
  GNOSIS_SAFE: "https://gnosis-safe.io/",
  PROPOSAL_TEMPLATE: "https://www.station.express/product/proposer#proposal-templates",
}

export const CHAIN_IDS = {
  ETHEREUM: 1,
  RINKEBY: 4,
  GOERLI: 5,
  OPTIMISM: 10,
  POLYGON: 137,
}

export const SUPPORTED_CHAINS = [chain.mainnet, chain.goerli, chain.optimism, chain.polygon]

export const SUPPORTED_CHAIN_IDS = SUPPORTED_CHAINS.map((chain) => chain.id)

export const validEnsDomains = ["eth", "xyz"]

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

export const PAYMENT_DIRECTION_MAP = {
  [PaymentDirection.AUTHOR_IS_RECIPIENT]: {
    copy: "Receiving payment",
  },
  [PaymentDirection.AUTHOR_IS_SENDER]: {
    copy: "Distributing payment",
  },
}

export const PAYMENT_TERM_MAP = {
  [PaymentTerm.ON_AGREEMENT]: {
    copy: "Pay in full upon proposal agreement",
  },
  [PaymentTerm.AFTER_COMPLETION]: {
    copy: "Pay in full after project completion",
  },
  [PaymentTerm.ADVANCE_PAYMENT]: {
    copy: "Advance payment",
  },
}

export const BODY_CONSTRAINT_MAP = {
  [ProposalTemplateFieldValidationName.MIN_WORDS]: {
    copy: "Minimum",
  },
}

export const PROPOSAL_ROLE_MAP = {
  [ProposalRoleType.CONTRIBUTOR]: "Contributor",
  [ProposalRoleType.CLIENT]: "Client",
  [ProposalRoleType.AUTHOR]: "Author",
}

export const PROPOSING_AS_ROLE_MAP = {
  [ProposalRoleType.CONTRIBUTOR]: {
    copy: "A contributor (responsible for delivering work)",
  },
  [ProposalRoleType.CLIENT]: {
    copy: "A client (responsible for reviewing and approving work)",
  },
  [ProposalRoleType.AUTHOR]: {
    copy: "An author (responsible for drafting the proposal as a third party)",
  },
}

export const txPathString = "/tx/"

export const PARTNERS = {
  FOXES: {
    // ADDRESS: "0xC3c74B36A7F7c3395c6D59086F5a49540ed180ED",
    // CHAIN_ID: 5,
    // switch to this for official release
    ADDRESS: "0x332557dE221d09AD5b164a665c585fca0200b4B1",
    CHAIN_ID: 1,
  },
  STATION: {
    // ADDRESS: "0x91d38BB4f803b64e94baFa8fce4e02d86C8380aB",
    // CHAIN_ID: 5,
    ADDRESS: "0xc517c83f417b73dA98647dad0FCB80af9f3b9531",
    CHAIN_ID: 1,
  },
  UNISWAP: {
    ADDRESS: "0x59079bbd7b318b39ebB64f486106F87cE3277f40",
    CHAIN_ID: 1,
    // ADDRESS: "0x0b74007a73ca49c96C833ba0E38Aa929ba71c40f",
    // CHAIN_ID: 5,
  },
  RADICLE: {
    // ADDRESS: "0x60A22232D40486c8E6A7699d02Bdc01f37ACb22f",
    // CHAIN_ID: 1,
    ADDRESS: "0xEAB32a423B3dA4049F1Ad379737fCf1f4F9a5137",
    CHAIN_ID: 5,
  },
}

export const TEMPLATES = {
  FOXES: {
    TERMS: {
      id: "835ef848-91c1-46da-bdf9-4b0a277fe808",
      title: "Phase 1 -- Terms",
      fields: [
        {
          key: RESERVED_KEYS.CONTRIBUTORS,
          mapsTo: RESERVED_KEYS.ROLES,
          value: [],
          fieldType: ProposalTemplateFieldType.OPEN,
        },
        {
          key: RESERVED_KEYS.AUTHORS,
          mapsTo: RESERVED_KEYS.ROLES,
          value: [],
          fieldType: ProposalTemplateFieldType.OPEN,
        },
        {
          key: RESERVED_KEYS.CLIENTS,
          mapsTo: RESERVED_KEYS.ROLES,
          value: [{ address: PARTNERS.FOXES.ADDRESS, type: ProposalRoleType.CLIENT }],
          fieldType: ProposalTemplateFieldType.PRESELECT,
        },
        {
          key: RESERVED_KEYS.BODY,
          mapsTo: RESERVED_KEYS.BODY,
          fieldType: ProposalTemplateFieldType.OPEN,
          validation: [
            {
              name: ProposalTemplateFieldValidationName.MIN_WORDS,
              args: [125],
            },
          ],
        },
        {
          key: RESERVED_KEYS.MILESTONES,
          mapsTo: RESERVED_KEYS.MILESTONES,
          value: [
            {
              title: "Upfront payment",
              index: 0,
            },
          ],
          fieldType: ProposalTemplateFieldType.PRESELECT,
        },
        {
          key: RESERVED_KEYS.PAYMENTS,
          mapsTo: RESERVED_KEYS.PAYMENTS,
          value: [
            {
              milestoneIndex: 0,
              senderAddress: PARTNERS.FOXES.ADDRESS,
              recipientAddress: undefined,
              token: {
                chainId: PARTNERS.FOXES.CHAIN_ID,
                ...getNetworkCoin(PARTNERS.FOXES.CHAIN_ID),
              },
              amount: 0.01,
            },
          ],
          fieldType: ProposalTemplateFieldType.PREFILL,
        },
        {
          key: RESERVED_KEYS.PAYMENT_TERMS,
          mapsTo: RESERVED_KEYS.PAYMENT_TERMS,
          value: PaymentTerm.ON_AGREEMENT,
          fieldType: ProposalTemplateFieldType.PRESELECT,
        },
      ],
    },
  },
  STATION: {
    NEWSTAND: {
      id: "cd28828c-e51a-4796-80f5-e39d4cc43fab",
      title: "Station is seeking stories about contributing in web3",
      fields: [
        {
          key: RESERVED_KEYS.CONTRIBUTORS,
          mapsTo: RESERVED_KEYS.ROLES,
          value: [],
          fieldType: ProposalTemplateFieldType.OPEN,
        },
        {
          key: RESERVED_KEYS.AUTHORS,
          mapsTo: RESERVED_KEYS.ROLES,
          value: [],
          fieldType: ProposalTemplateFieldType.OPEN,
        },
        {
          key: RESERVED_KEYS.CLIENTS,
          mapsTo: RESERVED_KEYS.ROLES,
          value: [{ address: PARTNERS.STATION.ADDRESS, type: ProposalRoleType.CLIENT }],
          fieldType: ProposalTemplateFieldType.PRESELECT,
        },
        {
          key: RESERVED_KEYS.MILESTONES,
          mapsTo: RESERVED_KEYS.MILESTONES,
          value: [
            {
              title: "Advance payment",
              index: 0,
            },
            {
              title: "Completion payment",
              index: 1,
            },
          ],
          fieldType: ProposalTemplateFieldType.PRESELECT,
        },
        {
          key: RESERVED_KEYS.PAYMENTS,
          mapsTo: RESERVED_KEYS.PAYMENTS,
          value: [
            {
              milestoneIndex: 0,
              senderAddress: PARTNERS.STATION.ADDRESS,
              recipientAddress: undefined,
              token: {
                ...getNetworkUsdc(PARTNERS.STATION.CHAIN_ID),
                chainId: PARTNERS.STATION.CHAIN_ID,
              },
              amount: 100,
            },
            {
              milestoneIndex: 1,
              senderAddress: PARTNERS.STATION.ADDRESS,
              recipientAddress: undefined,
              token: {
                ...getNetworkUsdc(PARTNERS.STATION.CHAIN_ID),
                chainId: PARTNERS.STATION.CHAIN_ID,
              },
              amount: 400,
            },
          ],
          fieldType: ProposalTemplateFieldType.PREFILL,
        },
        {
          key: RESERVED_KEYS.PAYMENT_TERMS,
          mapsTo: RESERVED_KEYS.PAYMENT_TERMS,
          value: PaymentTerm.ADVANCE_PAYMENT,
          fieldType: ProposalTemplateFieldType.PRESELECT,
        },
      ],
    },
  },
  UNISWAP: {
    POAP_DESIGN: {
      id: "96058a8b-b1f5-4ba5-811d-e3415eccb3ce",
      title: "Design Uniswap’s POAP",
      fields: [
        {
          key: RESERVED_KEYS.CONTRIBUTORS,
          mapsTo: RESERVED_KEYS.ROLES,
          value: [],
          fieldType: ProposalTemplateFieldType.OPEN,
        },
        {
          key: RESERVED_KEYS.AUTHORS,
          mapsTo: RESERVED_KEYS.ROLES,
          value: [],
          fieldType: ProposalTemplateFieldType.OPEN,
        },
        {
          key: RESERVED_KEYS.CLIENTS,
          mapsTo: RESERVED_KEYS.ROLES,
          value: [{ address: PARTNERS.UNISWAP.ADDRESS, type: ProposalRoleType.CLIENT }],
          fieldType: ProposalTemplateFieldType.PRESELECT,
        },
        {
          key: RESERVED_KEYS.MILESTONES,
          mapsTo: RESERVED_KEYS.MILESTONES,
          value: [
            {
              title: "Upfront payment",
              index: 0,
            },
          ],
          fieldType: ProposalTemplateFieldType.PRESELECT,
        },
        {
          key: RESERVED_KEYS.PAYMENTS,
          mapsTo: RESERVED_KEYS.PAYMENTS,
          value: [
            {
              milestoneIndex: 0,
              senderAddress: PARTNERS.UNISWAP.ADDRESS,
              recipientAddress: undefined,
              token: {
                ...getNetworkUsdc(PARTNERS.UNISWAP.CHAIN_ID),
                chainId: PARTNERS.UNISWAP.CHAIN_ID,
              },
              amount: 50,
            },
          ],
          fieldType: ProposalTemplateFieldType.PREFILL,
        },
        {
          key: RESERVED_KEYS.PAYMENT_TERMS,
          mapsTo: RESERVED_KEYS.PAYMENT_TERMS,
          value: PaymentTerm.ON_AGREEMENT,
          fieldType: ProposalTemplateFieldType.PRESELECT,
        },
      ],
    },
    COMMUNITY_NEWSLETTER: {
      id: "12304dbb-7f19-4924-8619-129d16021adf",
      title: "Draft Uniswap community newsletter",
      fields: [
        {
          key: RESERVED_KEYS.CONTRIBUTORS,
          mapsTo: RESERVED_KEYS.ROLES,
          value: [],
          fieldType: ProposalTemplateFieldType.OPEN,
        },
        {
          key: RESERVED_KEYS.AUTHORS,
          mapsTo: RESERVED_KEYS.ROLES,
          value: [],
          fieldType: ProposalTemplateFieldType.OPEN,
        },
        {
          key: RESERVED_KEYS.CLIENTS,
          mapsTo: RESERVED_KEYS.ROLES,
          value: [{ address: PARTNERS.UNISWAP.ADDRESS, type: ProposalRoleType.CLIENT }],
          fieldType: ProposalTemplateFieldType.PRESELECT,
        },
        {
          key: RESERVED_KEYS.MILESTONES,
          mapsTo: RESERVED_KEYS.MILESTONES,
          value: [
            {
              title: "Upfront payment",
              index: 0,
            },
          ],
          fieldType: ProposalTemplateFieldType.PRESELECT,
        },
        {
          key: RESERVED_KEYS.PAYMENTS,
          mapsTo: RESERVED_KEYS.PAYMENTS,
          value: [
            {
              milestoneIndex: 0,
              senderAddress: PARTNERS.STATION.ADDRESS,
              recipientAddress: undefined,
              token: {
                ...getNetworkUsdc(PARTNERS.UNISWAP.CHAIN_ID),
                chainId: PARTNERS.UNISWAP.CHAIN_ID,
              },
              amount: 1000,
            },
          ],
          fieldType: ProposalTemplateFieldType.PREFILL,
        },
        {
          key: RESERVED_KEYS.PAYMENT_TERMS,
          mapsTo: RESERVED_KEYS.PAYMENT_TERMS,
          value: PaymentTerm.ON_AGREEMENT,
          fieldType: ProposalTemplateFieldType.PRESELECT,
        },
      ],
    },
  },
  RADICLE: {
    GIVETH_IDEAS: {
      id: "163dabe4-20f7-4384-87e5-d6678249c229",
      title: "Contribute ideas to the Radicle x Giveth partnership",
      fields: [
        {
          key: RESERVED_KEYS.CONTRIBUTORS,
          mapsTo: RESERVED_KEYS.ROLES,
          value: [],
          fieldType: ProposalTemplateFieldType.OPEN,
        },
        {
          key: RESERVED_KEYS.AUTHORS,
          mapsTo: RESERVED_KEYS.ROLES,
          value: [],
          fieldType: ProposalTemplateFieldType.OPEN,
        },
        {
          key: RESERVED_KEYS.CLIENTS,
          mapsTo: RESERVED_KEYS.ROLES,
          value: [{ address: PARTNERS.RADICLE.ADDRESS, type: ProposalRoleType.CLIENT }],
          fieldType: ProposalTemplateFieldType.PRESELECT,
        },
        {
          key: RESERVED_KEYS.MILESTONES,
          mapsTo: RESERVED_KEYS.MILESTONES,
          value: [],
          fieldType: ProposalTemplateFieldType.PRESELECT,
        },
        {
          key: RESERVED_KEYS.PAYMENTS,
          mapsTo: RESERVED_KEYS.PAYMENTS,
          value: [],
          fieldType: ProposalTemplateFieldType.PRESELECT,
        },
        {
          key: RESERVED_KEYS.PAYMENT_TERMS,
          mapsTo: RESERVED_KEYS.PAYMENT_TERMS,
          value: undefined,
          fieldType: ProposalTemplateFieldType.PRESELECT,
        },
      ],
    },
  },
}

// LEGACY
// kept to support Station Labs NFT through the /nft/token api route
export enum AccountInitiativeStatus {
  INTERESTED = "INTERESTED",
  CONTRIBUTING = "CONTRIBUTING",
  PREVIOUSLY_CONTRIBUTED = "PREVIOUSLY_CONTRIBUTED",
}
