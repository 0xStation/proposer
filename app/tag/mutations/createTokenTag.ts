import db from "db"
import * as z from "zod"
import { TokenType } from "app/types/token"
import { TagType } from "../types"

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
      type: TagType.TOKEN,
      data: {
        chainId: params.chainId,
        address: params.address,
        type: params.type,
        name: params.name,
        symbol: params.symbol,
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
