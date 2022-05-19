import db from "db"
import * as z from "zod"
import { Account } from "../types"

const GetAccountByAddress = z.object({
  address: z.string().optional(),
})

export default async function getAccountByAddress(input: z.infer<typeof GetAccountByAddress>) {
  const data = GetAccountByAddress.parse(input)

  if (!data.address) {
    return null
  }

  const account = await db.account.findFirst({
    where: { address: data.address },
    include: {
      tickets: {
        include: {
          terminal: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      },
    },
  })

  if (!account) {
    return null
  }

  return account as Account
}
