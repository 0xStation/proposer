import db from "db"
import * as z from "zod"

const CreateTokenTag = z.object({
  terminalId: z.number(),
  name: z.string(),
  symbol: z.string(),
  type: z.string(),
  address: z.string(),
})

export default async function createTokenTag(input: z.infer<typeof CreateTokenTag>) {
  const params = CreateTokenTag.parse(input)

  const tag = db.tag.create({
    data: {
      terminalId: params.terminalId,
      value: params.name.toLowerCase(),
      active: true,
      type: "token",
      data: {
        tokenAddress: params.address,
        symbol: params.symbol,
        ercType: params.type,
      },
    },
  })

  return tag
}
