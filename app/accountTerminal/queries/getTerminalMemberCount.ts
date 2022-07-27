import db from "db"
import * as z from "zod"

const GetTerminalMemberCount = z.object({
  terminalId: z.number(),
})

export const getTerminalMemberCount = async (input: z.infer<typeof GetTerminalMemberCount>) => {
  const data = GetTerminalMemberCount.parse(input)
  const { terminalId } = data

  try {
    const count = await db.accountTerminal.count({
      where: {
        terminalId: terminalId,
      },
    })

    return count
  } catch (err) {
    console.error("Error fetching members. Failed with error: ", err)
    return 0
  }
}

export default getTerminalMemberCount
