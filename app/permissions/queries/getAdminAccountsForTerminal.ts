import db, { AccountTerminal, AccountTerminalTag } from "db"
import * as z from "zod"
import { TerminalMetadata } from "app/terminal/types"
import { Account } from "app/account/types"

const GetAdminAccountsForTerminal = z.object({
  terminalId: z.number(),
})

// returns true/false whether user has admin permissions
// (user can access all of the terminal settings subpages and create rfps)
// based on whether they have the right tags associated with
// their account.
export const getAdminAccountsForTerminal = async (
  input: z.infer<typeof GetAdminAccountsForTerminal>
) => {
  try {
    const terminal = await db.terminal.findFirst({
      where: { id: input.terminalId },
    })

    if (!terminal) {
      return []
    }

    const adminTagIdWhitelist = (terminal?.data as TerminalMetadata)?.permissions
      ?.adminTagIdWhitelist

    const adminAccountTerminalTags = await db.accountTerminalTag.findMany({
      where: {
        ticketTerminalId: input.terminalId,
        AND: {
          tagId: { in: adminTagIdWhitelist },
        },
      },
      include: {
        ticket: {
          include: {
            account: true,
          },
        },
      },
    })

    return adminAccountTerminalTags.map(
      (adminAccountTerminalTag) => adminAccountTerminalTag.ticket.account
    ) as Account[]
  } catch (err) {
    console.error("Failed query getAdminAccountsForTerminal", err)
    return []
  }
}

export default getAdminAccountsForTerminal
