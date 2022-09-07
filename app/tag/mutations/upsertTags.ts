import db from "db"
import { Ctx } from "blitz"
import * as z from "zod"
import { Terminal } from "app/terminal/types"
import { Prisma } from "@prisma/client"

const UpsertTags = z.object({
  terminalId: z.number(),
  tags: z
    .object({
      value: z.string(),
      type: z.string(),
      active: z.boolean(),
      discordId: z.string().optional(),
    })
    .array(),
})

export default async function upsertTags(input: z.infer<typeof UpsertTags>, ctx: Ctx) {
  const params = UpsertTags.parse(input)

  const terminal = (await db.terminal.findUnique({
    where: { id: params.terminalId },
  })) as Terminal

  if (!terminal) {
    throw new Error("Cannot create a checkbook for a terminal that does not exist.")
  }

  const terminalAdminTags = terminal.data.permissions.adminTagIdWhitelist

  if (!terminalAdminTags || terminalAdminTags.length === 0) {
    throw new Error(
      "No admin tags available for this terminal. Nobody is in control, so there is no way to auth."
    )
  }

  const accountTerminalTags = await db.accountTerminalTag.findMany({
    where: { tagId: { in: terminalAdminTags } },
    select: { ticketAccountId: true },
  })

  ctx.session.$authorize(
    [],
    accountTerminalTags.map((accountTerminalTag) => accountTerminalTag.ticketAccountId)
  )

  // prisma does not natively support "upsertMany"
  // so the idea here is to create a list of transaction requests, one per upsert
  // then send it into prismas "$transaction" api which will atomically run the batch
  // meaning they will either all succeed, or one or many will error and the whole batch will roll back.
  // this way, we don't get partial writes if some fail.
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
        active: t.active,
      },
      create: {
        value: t.value.toLowerCase(),
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
