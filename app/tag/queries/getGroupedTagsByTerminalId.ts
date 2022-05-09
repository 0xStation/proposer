import db from "db"
import * as z from "zod"

const GetGroupedTagsByTerminalId = z.object({
  terminalId: z.number(),
  type: z.string().optional(),
})

export default async function getGroupedTagsByTerminalId(
  input: z.infer<typeof GetGroupedTagsByTerminalId>
) {
  const data = GetGroupedTagsByTerminalId.parse(input)
  const { terminalId, type } = data

  const tags = await db.tag.findMany({
    where: {
      terminalId: terminalId,
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

  const groupedTags = {}

  tags.forEach((tag) => {
    if (groupedTags[tag.type]) {
      groupedTags[tag.type].push(tag)
    } else {
      groupedTags[tag.type] = [tag]
    }
  })

  // TODO: error handling

  return groupedTags
}
