import db from "../../../../../db/index"
import { Terminal } from "app/terminal/types"
import { z } from "zod"

const GetInvitePermissions = z.object({
  inviterId: z.number(),
  terminalId: z.number(),
})

// Given the inviter's id and terminal id, we're checking
// whether the inviter is in the terminal and has inviting permissions
// based on their given role.
export const getInvitePermissions = async (input) => {
  // const data = GetInvitePermissions.parse(input)
  // const inviterTerminal = await db.accountTerminal.findUnique({
  //   where: {
  //     accountId_terminalId: {
  //       accountId: data?.inviterId,
  //       terminalId: data?.terminalId,
  //     },
  //   },
  //   include: { role: true, terminal: true },
  // })
  // if (!inviterTerminal) {
  //   console.warn("This inviter is not found in the provided terminal")
  //   return []
  // }
  // // `inviterTerminal.terminal.data.permissions.invite` is a lookup map
  // // that will return the list of role local ids that the inviter's role is allowed
  // // to invite.
  // return (
  //   (inviterTerminal?.terminal as Terminal)?.data.permissions?.invite[
  //     inviterTerminal.role?.localId as number
  //   ] || []
  // )
}

export default getInvitePermissions
