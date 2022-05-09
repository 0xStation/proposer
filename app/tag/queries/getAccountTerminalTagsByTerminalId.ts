import db from "db"
import * as z from "zod"
const GetAccountTerminalTagsByTerminalId = z.object({
  terminalId: z.number(),
})

export default async function getAccountTerminalTagsByTerminalId(
  input: z.infer<typeof GetAccountTerminalTagsByTerminalId>
) {
  const data = GetAccountTerminalTagsByTerminalId.parse(input)
  const { terminalId } = data

  const accountTerminalTags = await db.accountTerminalTag.findMany({
    where: { ticketTerminalId: terminalId },
    include: {
      ticket: {
        include: {
          account: true,
        },
      },
    },
    distinct: ["ticketAccountId"],
  })

  if (!accountTerminalTags) {
    // TODO: better error handling
    console.error("No account tags")
  }

  return accountTerminalTags
}
