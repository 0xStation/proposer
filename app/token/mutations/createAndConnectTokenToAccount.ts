import db, { TokenType } from "db"
import { Ctx } from "blitz"
import { z } from "zod"
import { ZodToken } from "app/types/zod"

const TokenAndAccountData = ZodToken

export const createAndConnectTokenToAccount = async (
  input: z.infer<typeof TokenAndAccountData>,
  ctx: Ctx
) => {
  const data = TokenAndAccountData.parse(input)
  const {
    address: tokenAddress,
    type: tokenType,
    chainId,
    name: tokenName,
    symbol: tokenSymbol,
    decimals,
  } = data
  try {
    const payload = {
      address: tokenAddress,
      type: tokenType as TokenType,
      chainId: chainId,
      name: tokenName,
      symbol: tokenSymbol,
      decimals: decimals,
      accounts: {
        connectOrCreate: [
          {
            where: {
              accountId_tokenAddress_chainId: {
                accountId: ctx.session.userId as number,
                tokenAddress,
                chainId,
              },
            },
            create: {
              accountId: ctx.session.userId as number,
            },
          },
        ],
      },
    }

    const token = await db.token.upsert({
      where: {
        address_chainId: {
          address: tokenAddress,
          chainId: chainId,
        },
      },
      update: payload,
      create: payload,
    })
    return token
  } catch (err) {
    console.error("Failure upserting new token", err)
    throw Error(err)
  }
}

export default createAndConnectTokenToAccount
