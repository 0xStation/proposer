import { defaultTicketImageUrl } from "app/core/utils/constants"
import { Terminal, MethodToVisualizeContributorsNft, TerminalMetadata } from "app/terminal/types"
import { Ticket } from "app/ticket/types"

// algorithm for finding the appropriate data source to retrieve a Contributor NFT's image
// can add more schemes over time to support wider customer needs

// NOTE: I'm going to change this soon as I build out the modular metadata retrieval system
export const getNftImageUrl = (terminal: Terminal, ticket: Ticket) => {
  const { visualizeNftMethod } = terminal.data as TerminalMetadata

  let url
  if (visualizeNftMethod === MethodToVisualizeContributorsNft.ROLE) {
    // Terminal uses per-role images, grab image URL from role metadata matching ticket role
    url = terminal.roles.find((r) => r.localId === ticket?.roleLocalId)?.data.imageUrl
  } else if (visualizeNftMethod === MethodToVisualizeContributorsNft.INDIVIDUAL) {
    // Terminal uses per-individual images, grab image URL from ticket metadata
    url = ticket?.data?.ticketImageUrl
  }

  return url || defaultTicketImageUrl
}
