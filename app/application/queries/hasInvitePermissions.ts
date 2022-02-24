import db from "../../../db/index"
import { Terminal } from "app/terminal/types"
import { z } from "zod"

const HasInvitePermissions = z.object({
  referrerId: z.number(),
  terminalId: z.number(),
})

export const hasInvitePermissions = async (input) => {
  const data = HasInvitePermissions.parse(input)
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
    include: { role: true },
  })

  if (!inviteeTerminal) {
    console.log("This invitee is not found in the provided terminal")
    return
  }

  const terminal = (await db.terminal.findUnique({
    where: { id: data?.terminalId },
  })) as Terminal

  if (!terminal) {
    console.log(`No terminal found with id ${data?.terminalId}`)
    return
  }

  return !!terminal.data.permissions?.invite[inviteeTerminal.role?.localId as number]
}

export default hasInvitePermissions
