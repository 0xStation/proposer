import { Account, AccountTerminal, Terminal } from "@prisma/client"
import { MetadataImageLogicType, TerminalMetadata } from "app/terminal/types"
import { TicketMetaData } from "app/ticket/types"

type imageContext = {
  terminal: Terminal
  account: Account
  ticket: AccountTerminal
}

// algorithm for finding the appropriate data source to retrieve a Contributor NFT's image
// can add more schemes over time to support wider customer needs
export const getImage = (context: imageContext) => {
  const imageConfig = (context.terminal.data as TerminalMetadata).metadata?.image
  if (!imageConfig) return ""
  if (imageConfig.logicType == MetadataImageLogicType.ROLE) {
    return imageConfig.roleMap![context.ticket.roleLocalId || 0] || ""
  } else if (imageConfig.logicType == MetadataImageLogicType.INDIVIDUAL) {
    return (context.ticket.data as TicketMetaData)?.ticketImageUrl || ""
  }
}
