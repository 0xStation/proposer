import db from "db"
import * as z from "zod"

const UpsertTags = z.object({
  terminalId: z.number(),
  tags: z
    .object({
      value: z.string(),
      type: z.string(),
      active: z.boolean(),
      discordId: z.string(),
    })
    .array(),
})

export default async function upsertTags(input: z.infer<typeof UpsertTags>) {
  const params = UpsertTags.parse(input)

  // prisma does not natively support "upsertMany"
  // so the idea here is to create a list of transaction requests, one per upsert
  // then send it into prismas "$transaction" api which will atomically run the batch
  // meaning they will either all succeed, or one or many will error and the whole batch will roll back.
  // this way, we don't get partial writes if some fail.
  const requests = params.tags.map((t) =>
    db.tag.upsert({
      where: {
        value_terminalId: {
          value: t.value,
          terminalId: params.terminalId,
        },
      },
      update: {
        type: t.type.toLowerCase(),
        active: t.active,
      },
      create: {
        value: t.value,
        active: t.active,
        type: t.type.toLowerCase(),
        discordId: t.discordId,
        terminalId: params.terminalId,
      },
    })
  )

  const tags = await db.$transaction(requests)
  return tags
}
