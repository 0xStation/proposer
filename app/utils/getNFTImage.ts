import { defaultTicketImageUrl } from "app/core/utils/constants"
import { Terminal, MethodToVisualizeContributorsNFT, TerminalMetadata } from "app/terminal/types"
import { Ticket } from "app/ticket/types"

// algorithm for finding the appropriate data source to retrieve a Contributor NFT's image
// can add more schemes over time to support wider customer needs

// NOTE: I'm going to change this soon as I build out the modular metadata retrieval system
export const getImageUrl = (terminal: Terminal, ticket: Ticket) => {
  const method = (terminal.data as TerminalMetadata).visualizeNFTMethod

  let url
  if (method === MethodToVisualizeContributorsNFT.ROLE) {
    // Terminal uses per-role images, grab image URL from role metadata matching ticket role
    url = terminal.roles.find((r) => r.localId === ticket?.roleLocalId)?.data.imageURL
  } else if (method === MethodToVisualizeContributorsNFT.INDIVIDUAL) {
    // Terminal uses per-individual images, grab image URL from ticket metadata
    url = ticket?.data?.ticketImageUrl
  }

  return url || defaultTicketImageUrl
}
