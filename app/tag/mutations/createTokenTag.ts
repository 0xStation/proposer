import db from "db"
import * as z from "zod"

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

  const tag = db.tag.create({
    data: {
      terminalId: params.terminalId,
      value: params.name,
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

  return tag
}
