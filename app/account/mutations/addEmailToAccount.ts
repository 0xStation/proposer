import db from "db"
import * as z from "zod"
import { Account } from "../types"
import { saveEmail } from "app/utils/privy"

const EmailAccount = z.object({
  email: z.string(),
  accountId: z.number(),
})

export default async function addEmailToAccount(input: z.infer<typeof EmailAccount>) {
  const existingAccount = (await db.account.findUnique({
    where: {
      id: input.accountId,
    },
  })) as Account

  if (!existingAccount) {
    console.error("cannot update an account that does not exist")
    return null
  }

  // store email with Privy so it does not live in our database to reduce leakage risk
  await saveEmail(existingAccount.address as string, input.email)

  const account = await db.account.update({
    where: {
      id: input.accountId,
    },
    data: {
      data: {
        ...existingAccount.data,
        email: input.email,
      },
    },
  })

  return account as Account
}
