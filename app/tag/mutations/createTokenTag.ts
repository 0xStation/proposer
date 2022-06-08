import db from "db"
import * as z from "zod"
import { TokenType } from "app/tag/types"

const CreateTokenTag = z.object({
  terminalId: z.number(),
  name: z.string(),
  symbol: z.string(),
  type: z.string(),
  address: z.string(),
  chainId: z.number(),
})

export default async function createTokenTag(input: z.infer<typeof CreateTokenTag>) {
  const params = CreateTokenTag.parse(input)

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

    await fetch(`${baseUrl}/api/discord/sync-roles`, {
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
