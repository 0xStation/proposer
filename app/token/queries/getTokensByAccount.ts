import db from "db"
import { Ctx } from "blitz"
import { z } from "zod"

const GetTokensByAccount = z.object({
  chainId: z.number(),
  userId: z.number().optional(),
})

export async function getTokensByAccount(input: z.infer<typeof GetTokensByAccount>, ctx: Ctx) {
  const data = GetTokensByAccount.parse(input)
  const { chainId, userId } = data

  try {
    const accountTokens = await db.accountToken.findMany({
      where: {
        chainId,
        accountId: userId || (ctx.session?.userId as number),
      },
      include: {
        token: true,
      },
    })

    return accountTokens.map((accountToken) => accountToken.token)
  } catch (err) {
    console.error("Failure fetching accountTokens", err)
    throw Error(err)
  }
}

export default getTokensByAccount
