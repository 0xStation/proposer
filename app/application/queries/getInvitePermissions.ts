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
    include: { role: true, terminal: true },
  })

  if (!inviteeTerminal) {
    console.log("This invitee is not found in the provided terminal")
    return
  }

  return (
    (inviteeTerminal?.terminal as Terminal)?.data.permissions?.invite[
      inviteeTerminal.role?.localId as number
    ] || []
  )
}

export default getInvitePermissions
