import db from "db"
import * as z from "zod"
import { TerminalMetadata } from "app/terminal/types"

const HasAdminPermissionsBasedOnTags = z.object({
  terminalId: z.number(),
  // when a user logs out, accountId becomes null and we want this query
  // to return false rather than throw a zod error
  accountId: z.number().optional(),
})

// returns true/false whether user has admin permissions
// (user can access all of the terminal settings subpages and create rfps)
// based on whether they have the right tags associated with
// their account.
export default async function hasAdminPermissionsBasedOnTags(
  input: z.infer<typeof HasAdminPermissionsBasedOnTags>
) {
  if (!input.accountId) {
    return false
  }

  try {
    const terminal = await db.terminal.findFirst({
      where: { id: input.terminalId },
    })

    if (!terminal) {
      return false
    }

    const adminTagIdWhitelist = (terminal?.data as TerminalMetadata)?.permissions
      ?.adminTagIdWhitelist

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
  } catch (err) {
    console.error("Failed check if user has admin permissions based on tags with error", err)
    return false
  }
}
