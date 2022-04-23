import db from "../../../../db/index"
import { Terminal } from "app/v1/terminal/types"
import { z } from "zod"

const HasInvitePermissions = z.object({
  inviterId: z.number(),
  terminalId: z.number(),
})

// Given the inviter's id and terminal id, we're checking
// whether the inviter is in the terminal and has inviting permissions
// based on their given role. We then return a boolean that returns true
// if the inviter has any inviting permissions.
export const hasInvitePermissions = async (input) => {
  const data = HasInvitePermissions.parse(input)

  const inviterTerminal = await db.accountTerminal.findUnique({
    where: {
      accountId_terminalId: {
        accountId: data?.inviterId,
        terminalId: data?.terminalId,
      },
    },
    include: { role: true },
  })

  if (!inviterTerminal) {
    console.warn("This inviter is not found in the provided terminal")
    return false
  }

  const terminal = (await db.terminal.findUnique({
    where: { id: data?.terminalId },
  })) as Terminal

  if (!terminal) {
    console.warn(`No terminal found with id ${data?.terminalId}`)
    return false
  }

  // `inviterTerminal.terminal.data.permissions.invite` is a lookup map
  // that will return the list of role local ids that the inviter's role is allowed
  // to invite.
  return !!terminal.data.permissions?.invite[inviterTerminal.role?.localId as number]
}

export default hasInvitePermissions
