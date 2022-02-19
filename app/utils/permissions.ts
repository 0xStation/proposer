import db from "../../db/index"
import { Terminal } from "app/terminal/types"

// not quite sure how well the "permissions" on the terminal data scales but
// we can roll with it for now -- just worried that once we have more than just "invite"
// it's going to get repetitive... but in the interest of not digging ourselves into too
// tight an abstraction I think this is fine for now.
const canInvite = async (invitedByAccountId, terminalId, accountId, initiativeId) => {
  // the invitee / terminal relation
  // required so we can see which role the invitee has
  // to tell if this is a valid invitation
  const inviteeTerminal = await db.accountTerminal.findUnique({
    where: {
      accountId_terminalId: {
        accountId: invitedByAccountId,
        terminalId: terminalId,
      },
    },
  })

  if (!inviteeTerminal) {
    console.log("This invitee is not found in the provided terminal")
    return
  }

  const invitedByRole = inviteeTerminal?.roleLocalId as number

  const terminal = (await db.terminal.findUnique({
    where: { id: terminalId },
  })) as Terminal

  if (!terminal) {
    console.log(`No terminal found with id ${terminalId}`)
    return
  }

  // do we want to check that the invitee is able to invite *up to the level requested*?
  // if we are calling this from front-end, do we want to return which levels are valid to invite?
  // e.g. staff can invite visitor, contributor, staff, but contributor can only invite contributor or visitor

  // const application = await db.accountInitiative.findUnique({
  //   where: {
  //     accountId_initiativeId: {
  //       accountId: accountId,
  //       initiativeId: initiativeId,
  //     },
  //   },
  // })

  const permissions = terminal.data.permissions

  return permissions.invite.includes(invitedByRole)
}

export { canInvite }
