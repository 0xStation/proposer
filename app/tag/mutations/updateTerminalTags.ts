import db from "db"
import * as z from "zod"

const UpdateTerminalTags = z.object({
  terminalId: z.number(),
  tags: z
    .object({
      value: z.string(),
      type: z.string(),
    })
    .array(),
})

export default async function updateTerminalTags(input: z.infer<typeof UpdateTerminalTags>) {
  const params = UpdateTerminalTags.parse(input)

  const tags = await db.tag.createMany({
    data: params.tags.map((tag) => {
      return {
        terminalId: params.terminalId,
        value: tag.value.toLowerCase(),
        type: tag.type.toLowerCase(),
      }
    }),
  })

  return tags
}
