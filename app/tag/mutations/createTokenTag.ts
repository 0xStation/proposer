import db from "db"
import { Ctx } from "blitz"
import * as z from "zod"
import { TokenType } from "app/tag/types"
import { Terminal } from "app/terminal/types"
import { Prisma } from "@prisma/client"

const CreateTokenTag = z.object({
  terminalId: z.number(),
  name: z.string(),
  symbol: z.string(),
  type: z.string(),
  address: z.string(),
  chainId: z.number(),
})

export default async function createTokenTag(input: z.infer<typeof CreateTokenTag>, ctx: Ctx) {
  const params = CreateTokenTag.parse(input)

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

  const tag = await db.tag.create({
    data: {
      terminalId: params.terminalId,
      value: params.type === TokenType.ERC20 ? `$${params.symbol}` : params.name,
      active: true,
      type: "token",
      data: {
        address: params.address,
        symbol: params.symbol,
        type: params.type,
        chainId: params.chainId,
      },
    },
  })

  try {
    process.env.NODE_ENV !== "production"
    const baseUrl =
      process.env.NODE_ENV !== "production"
        ? "http://localhost:3000"
        : "https://app.station.express"

    await fetch(`${baseUrl}/api/discord/sync-tokens`, {
      method: "POST",
      body: JSON.stringify({
        terminalId: params.terminalId,
      }),
    })
  } catch (e) {
    console.log(e)
  }

  return tag
}
