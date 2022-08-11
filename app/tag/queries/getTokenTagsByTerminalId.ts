import db from "db"
import * as z from "zod"
import { Tag, TagType } from "../types"

const GetTokenTagsByTerminalId = z.object({
  terminalId: z.number(),
})

export const getTokenTagsByTerminalId = async (input: z.infer<typeof GetTokenTagsByTerminalId>) => {
  const data = GetTokenTagsByTerminalId.parse(input)
  const { terminalId } = data

  try {
    const tags = await db.tag.findMany({
      where: {
        terminalId: terminalId,
        type: {
          equals: TagType.TOKEN,
        },
        NOT: {
          type: {
            contains: TagType.INACTIVE,
          },
        },
      },
    })

    if (!tags) {
      return []
    }

    return tags as Tag[]
  } catch (err) {
    console.error("Error fetching token tags. Failed with error: ", err)
    return []
  }
}

export default getTokenTagsByTerminalId
