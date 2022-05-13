import db from "db"
import * as z from "zod"
import { AccountTerminalWithTagsAndAccount } from "../types"
const GetMembersByTerminalId = z.object({
  terminalId: z.number(),
})

export default async function getMembersByTerminalId(
  input: z.infer<typeof GetMembersByTerminalId>
) {
  const data = GetMembersByTerminalId.parse(input)
  const { terminalId } = data

  try {
    const members = await db.accountTerminal.findMany({
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

    return members as AccountTerminalWithTagsAndAccount[]
  } catch (err) {
    console.error("Error fetching members. Failed with error: ", err)
    return [] as AccountTerminalWithTagsAndAccount[]
  }
}
