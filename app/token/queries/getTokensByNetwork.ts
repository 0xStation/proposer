import db from "db"
import { Ctx } from "blitz"
import { z } from "zod"

const GetTokensByNetwork = z.object({
  chainId: z.number(),
})

export async function getTokensByNetwork(input: z.infer<typeof GetTokensByNetwork>, ctx: Ctx) {
  const params = GetTokensByNetwork.parse(input)

  try {
    const tokens = await db.token.findMany({
      where: {
        chainId: params.chainId,
      },
    })

    return tokens
  } catch (err) {
    console.error("Failure fetching tokens", err)
    throw Error(err)
  }
}

export default getTokensByNetwork
