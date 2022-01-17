import db from "db"
import * as z from "zod"
import { Account } from "../types"

const CreateAccount = z.object({
  handle: z.string(),
  discordId: z.string(),
  pronouns: z.string(),
  timezone: z.string(),
  address: z.string(),
})

export default async function createAccount(input: z.infer<typeof CreateAccount>) {
  const params = CreateAccount.parse(input)

  const payload = {
    address: params.address,
    data: {
      // remove address?
      ...params,
    },
  }

  const account = await db.account.create({ data: payload })
  return account as Account
}
