import db from "db"
import * as z from "zod"
import { Tag } from "../types"

const GetTokenTagByTerminalId = z.object({
  terminalId: z.number(),
})

export const getTokenTagByTerminalId = async (input: z.infer<typeof GetTokenTagByTerminalId>) => {
  const data = GetTokenTagByTerminalId.parse(input)
  const { terminalId } = data

  try {
    const tags = await db.tag.findMany({
      where: {
        terminalId: terminalId,
        type: {
          equals: "token",
        },
        NOT: {
          type: {
            contains: "inactive",
          },
        },
      },
    })

    if (!tags) {
      return null
    }

    return tags as Tag[]
  } catch (err) {
    console.error("Error fetching token tags. Failed with error: ", err)
    return null
  }
}

export default getTokenTagByTerminalId
