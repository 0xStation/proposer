import db from "db"
import * as z from "zod"
const GetAccountTerminalsByTerminalId = z.object({
  terminalId: z.number(),
})

export default async function getAccountTerminalTagsByTerminalId(
  input: z.infer<typeof GetAccountTerminalsByTerminalId>
) {
  const data = GetAccountTerminalsByTerminalId.parse(input)
  const { terminalId } = data

  const accountTerminals = await db.accountTerminal.findMany({
    where: { terminalId: terminalId },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      account: true,
    },
  })

  if (!accountTerminals) {
    // TODO: better error handling
    console.error("No account terminals")
  }

  return accountTerminals
}
