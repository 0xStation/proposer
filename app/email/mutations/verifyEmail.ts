import { Account, AccountMetadata } from "app/account/types"
import db from "db"
import * as z from "zod"

const VerifyEmail = z.object({
  accountId: z.number(),
  accountAddress: z.string(),
  verificationCode: z.string(),
})

export default async function verifyEmail(input: z.infer<typeof VerifyEmail>) {
  try {
    const params = VerifyEmail.parse(input)
    const emailVerification = await db.emailVerification.findUnique({
      where: {
        accountId: params.accountId,
      },
    })

    const existingAccount = (await db.account.findUnique({
      where: { id: params.accountId },
    })) as Account

    if (!existingAccount) {
      throw Error("account doesn't exist")
    }

    if (existingAccount?.data?.hasVerifiedEmail) {
      return true
    }

    if (emailVerification?.code === params.verificationCode) {
      await db.account.update({
        where: { id: params.accountId },
        data: {
          data: {
            ...(existingAccount.data as AccountMetadata),
            hasSavedEmail: true,
            hasVerifiedEmail: true,
          },
        },
      })
      return true
    }

    return false
  } catch (err) {
    console.error("Error verifying email. Failed with err: ", err)
    return false
  }
}
