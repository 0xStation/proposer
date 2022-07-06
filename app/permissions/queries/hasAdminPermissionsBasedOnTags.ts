import db from "db"
import * as z from "zod"
import { TerminalMetadata } from "app/terminal/types"

const HasAdminPermissionsBasedOnTags = z.object({
  terminalId: z.number(),
  accountId: z.number(),
})

// returns true/false whether user has admin permissions
// ( can access to all of the terminal settings subpages)
// based on whether they have the right tags associated with
// their account.
export default async function hasAdminPermissionsBasedOnTags(
  input: z.infer<typeof HasAdminPermissionsBasedOnTags>
) {
  const terminal = await db.terminal.findFirst({
    where: { id: input.terminalId },
  })

  if (!terminal) {
    return false
  }

  const adminTagIdWhitelist = (terminal?.data as TerminalMetadata)?.permissions?.adminTagIdWhitelist

  const containsTag = await db.accountTerminalTag.findFirst({
    where: {
      ticketAccountId: input.accountId,
      ticketTerminalId: input.terminalId,
      AND: {
        tagId: { in: adminTagIdWhitelist },
      },
    },
  })

  return !!containsTag
}
