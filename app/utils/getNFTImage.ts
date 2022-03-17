import { AccountTerminal, Terminal } from "@prisma/client"
import { defaultTicketImageUrl } from "app/core/utils/constants"
import { MetadataImageLogicType, TerminalMetadata } from "app/terminal/types"
import { TicketMetadata } from "app/ticket/types"

// algorithm for finding the appropriate data source to retrieve a Contributor NFT's image
// can add more schemes over time to support wider customer needs
export const getImageUrl = (terminal: Terminal, ticket: AccountTerminal) => {
  const imageConfig = (terminal.data as TerminalMetadata).metadata?.imageConfig
  const logicType = imageConfig?.logicType as string

  let url
  if (MetadataImageLogicType.ROLE === logicType) {
    // Terminal uses per-role images, grab image URL from terminal metadata by providing role localId
    url = imageConfig?.roleMap![ticket.roleLocalId as number]
  } else if (MetadataImageLogicType.INDIVIDUAL === logicType) {
    // Terminal uses per-individual images, grab image URL from ticket metadata
    url = (ticket?.data as TicketMetadata)?.ticketImageUrl
  }

  if (!url) {
    url = defaultTicketImageUrl
  }

  return url
}
