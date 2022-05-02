import db from "db"
import * as z from "zod"

const UpsertTags = z.object({
  terminalId: z.number(),
  tags: z
    .object({
      value: z.string(),
      type: z.string(),
    })
    .array(),
})

export default async function upsertTags(input: z.infer<typeof UpsertTags>) {
  const params = UpsertTags.parse(input)

  const requests = params.tags.map((t) =>
    db.tag.upsert({
      where: {
        value_terminalId: {
          value: t.value.toLowerCase(),
          terminalId: params.terminalId,
        },
      },
      update: {
        type: t.type.toLowerCase(),
      },
      create: {
        value: t.value.toLowerCase(),
        type: t.type.toLowerCase(),
        terminalId: params.terminalId,
      },
    })
  )

  const tags = await db.$transaction(requests)
  return tags
}
