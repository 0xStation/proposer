import db from "db"
import * as z from "zod"
import * as email from "app/utils/email"
import { getEmail } from "app/utils/privy"
import { Account } from "app/account/types"

const SendVerificationEmail = z.object({
  accountId: z.number(),
})

export async function sendVerificationEmail(input: z.infer<typeof SendVerificationEmail>) {
  let emailVerification
  try {
    const params = SendVerificationEmail.parse(input)

    emailVerification = await db.emailVerification.findUnique({
      where: {
        accountId: params.accountId,
      },
    })

    if (!emailVerification) {
      emailVerification = await db.emailVerification.create({
        data: {
          accountId: params.accountId,
        },
      })
    }

    if (!emailVerification.code) {
      throw Error("email verification code missing")
    }

    const account = (await db.account.findFirst({ where: { id: params.accountId } })) as Account
    let recipientEmail
    if (!!account?.data?.hasSavedEmail) {
      recipientEmail = await getEmail(account?.address as string)
    }

    await email.sendVerificationEmail({
      recipients: [recipientEmail],
      account: account,
      verificationCode: emailVerification.code,
    })
  } catch (err) {
    console.error("Error fetching email verification. Failed with err: ", err)
    return null
  }
}

export default sendVerificationEmail
