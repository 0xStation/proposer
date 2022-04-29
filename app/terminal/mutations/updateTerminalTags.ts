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

  const payload = {
    tags: {
      create: params.tags.map((tag) => {
        return {
          tag: {
            connectOrCreate: {
              where: {
                value: tag.value.toLowerCase(),
              },
              create: {
                value: tag.value.toLowerCase(),
                type: tag.type.toLowerCase(),
              },
            },
          },
        }
      }),
    },
  }

  const terminal = await db.terminal.update({
    where: { id: params.terminalId },
    data: payload,
    include: {
      tags: true,
    },
  })

  return terminal
}
