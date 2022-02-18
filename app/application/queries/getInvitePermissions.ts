import db from "../../../db/index"
import { Terminal } from "app/terminal/types"
import { z } from "zod"

const GetInvitePermissions = z.object({
  referrerId: z.number(),
  terminalId: z.number(),
})

export const getInvitePermissions = async (input) => {
  const data = GetInvitePermissions.parse(input)
  // the invitee / terminal relation
  // required so we can see which role the invitee has
  // to tell if this is a valid invitation
  const inviteeTerminal = await db.accountTerminal.findUnique({
    where: {
      accountId_terminalId: {
        accountId: data?.referrerId,
        terminalId: data?.terminalId,
      },
    },
  })

  if (!inviteeTerminal) {
    console.log("This invitee is not found in the provided terminal")
    return
  }

  const invitedByRole = inviteeTerminal?.roleLocalId as number

  const terminal = (await db.terminal.findUnique({
    where: { id: data?.terminalId },
  })) as Terminal

  if (!terminal) {
    console.log(`No terminal found with id ${data?.terminalId}`)
    return
  }

  const permissions = terminal.data.permissions

  return permissions?.invite?.rolesAllowedToInvite?.includes(invitedByRole)
}

export default getInvitePermissions
