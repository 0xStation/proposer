import db from "db"
import { Ctx } from "blitz"
import { z } from "zod"

const GetTokensByAccount = z.object({
  userId: z.number().optional(),
  chainId: z.number().optional(),
})

export async function getTokensByAccount(input: z.infer<typeof GetTokensByAccount>, ctx: Ctx) {
  const params = GetTokensByAccount.parse(input)
  const { chainId, userId } = params

  try {
    const accountTokens = await db.accountToken.findMany({
      where: {
        accountId: userId || (ctx.session?.userId as number),
        ...(chainId ? { chainId } : {}),
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
