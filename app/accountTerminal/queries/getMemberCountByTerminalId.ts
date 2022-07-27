import db from "db"
import * as z from "zod"
const GetMembersByTerminalId = z.object({
  terminalId: z.number(),
  tagGroups: z.number().array().array(),
})

export default async function getMembersByTerminalId(
  input: z.infer<typeof GetMembersByTerminalId>
) {
  const data = GetMembersByTerminalId.parse(input)
  const { terminalId, tagGroups } = data

  try {
    const count = await db.accountTerminal.count({
      where: {
        terminalId: terminalId,
        AND: tagGroups.map((tagGroup) => {
          return {
            tags: {
              some: {
                tagId: { in: tagGroup },
              },
            },
          }
        }),
      },
    })

    return count
  } catch (err) {
    console.error("Error fetching members. Failed with error: ", err)
    return 0
  }
}
