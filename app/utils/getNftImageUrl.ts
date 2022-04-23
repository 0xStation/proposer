import { defaultTicketImageUrl } from "app/core/utils/constants"
import { Terminal } from "app/deprecated/v1/terminal/types"
import { Ticket } from "app/ticket/types"

// algorithm for finding the appropriate data source to retrieve a Contributor NFT's image
// can add more schemes over time to support wider customer needs
// current flow minimizes seed overhead by automatically working if you start associating
// imageUrl's with other db entities

// NOTE: I'm going to change this soon as I build out the modular metadata retrieval system
export const getNftImageUrl = (terminal: Terminal, ticket: Ticket) => {
  // if account has a specific image for their ticket, return that
  let url = ticket?.data?.ticketImageUrl
  if (url) {
    return url
  }
  // if account does not have personal image, check if role has an image
  // allows terminals to give an image for newly minted users before an account-specific one is created
  url = terminal.roles.find((r) => r.localId === ticket?.roleLocalId)?.data.imageUrl
  if (url) {
    return url
  }
  // if no image for personal ticket or role, return default
  return defaultTicketImageUrl
}
