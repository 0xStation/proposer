import db from "db"
import * as z from "zod"

const GetGroupedTagsByTerminalId = z.object({
  terminalId: z.number(),
})

/* 
  `groupedTags` returns an object where the key
  is the tag type and the value is an array of tags
  that are categorized by the type:
  {
    initative: [tag1, ...., tagn],
    role: [tag1, ...., tagn],
  }
*/
export default async function getGroupedTagsByTerminalId(
  input: z.infer<typeof GetGroupedTagsByTerminalId>
) {
  const data = GetGroupedTagsByTerminalId.parse(input)
  const { terminalId } = data

  try {
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

    const groupedTags = tags.reduce((groupedTags, tag) => {
      if (groupedTags[tag.type]) {
        groupedTags[tag.type].push(tag)
      } else {
        groupedTags[tag.type] = [tag]
      }
      return groupedTags
    }, {})

    return groupedTags
  } catch (err) {
    console.error("Error fetching terminal tags. Failed with error: ", err)
    return null
  }
}
