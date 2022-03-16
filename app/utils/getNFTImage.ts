import { Account, AccountTerminal, Terminal } from "@prisma/client"
import { MetadataImageLogicType, TerminalMetadata } from "app/terminal/types"
import { TicketMetadata } from "app/ticket/types"

type imageContext = {
  terminal: Terminal
  account: Account
  ticket: AccountTerminal
}

// algorithm for finding the appropriate data source to retrieve a Contributor NFT's image
// can add more schemes over time to support wider customer needs
export const getImage = (context: imageContext) => {
  const imageConfig = (context.terminal.data as TerminalMetadata).metadata?.imageConfig

  const logicMapping = {
    // Terminal uses per-role images, grab image URL from terminal metadata by providing role localId
    [MetadataImageLogicType.ROLE]: imageConfig?.roleMap![context.ticket.roleLocalId as number],
    // Terminal uses per-individual images, grab image URL from ticket metadata
    [MetadataImageLogicType.INDIVIDUAL]: (context.ticket.data as TicketMetadata)?.ticketImageUrl,
  }

  return logicMapping[imageConfig?.logicType as string] || ""
}
