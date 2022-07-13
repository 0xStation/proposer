import db from "db"
import * as z from "zod"
import { Account } from "../types"
import { saveEmail } from "app/utils/privy"

const SaveAccountEmail = z.object({
  email: z.string(),
  accountId: z.number(),
})

export default async function saveAccountEmail(input: z.infer<typeof SaveAccountEmail>) {
  const params = SaveAccountEmail.parse(input)

  const existingAccount = (await db.account.findUnique({
    where: {
      id: params.accountId,
    },
  })) as Account

  if (!existingAccount) {
    console.error("cannot update an account that does not exist")
    return null
  }

  // store email with Privy so it does not live in our database to reduce leakage risk
  // not in try-catch to handle errors on client
  await saveEmail(existingAccount.address as string, params.email)

  // mark email as saved for this account to not show email input modals
  const account = await db.account.update({
    where: { id: params.accountId },
    data: {
      data: {
        ...existingAccount.data,
        hasSavedEmail: true,
        // TODO: if email was saved with a new value, set hasVerifiedEmail to false
      },
    },
  })

  return account as unknown as Account
}
