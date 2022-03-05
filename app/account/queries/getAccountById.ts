import db from "db"
import * as z from "zod"
import { Account } from "../types"

const GetAccountById = z.object({
  id: z.number(),
})

export default async function getAccountByAddress(input: z.infer<typeof GetAccountById>) {
  const data = GetAccountById.parse(input)
  const account = await db.account.findFirst({
    where: { id: data.id },
    include: {
      initiatives: {
        include: {
          initiative: true,
        },
      },
    },
  })

  if (!account) {
    return null
  }

  return account as Account
}
