import db from "db"
import * as z from "zod"
import { Account } from "../types"

const GetAccountByAddress = z.object({
  address: z.string(),
})

export default async function getAccountByAddress(input: z.infer<typeof GetAccountByAddress>) {
  const data = GetAccountByAddress.parse(input)
  const account = await db.account.findFirst({
    where: { address: data.address },
    include: {
      initiatives: true,
    },
  })

  if (!account) {
    return null
  }

  return account as Account
}
