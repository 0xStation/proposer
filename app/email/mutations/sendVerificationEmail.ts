import db from "db"
import * as z from "zod"
import * as email from "app/utils/email"
import { getEmail } from "app/utils/privy"
import { Account } from "app/account/types"

const SendVerificationEmail = z.object({
  accountId: z.number(),
})

export async function sendVerificationEmail(input: z.infer<typeof SendVerificationEmail>) {
  try {
    const params = SendVerificationEmail.parse(input)

    const account = (await db.account.findFirst({ where: { id: params.accountId } })) as Account
    let recipientEmail
    if (account?.data?.hasSavedEmail) {
      recipientEmail = await getEmail(account?.address as string)
    }

    if (!recipientEmail) {
      throw Error("recipient email missing")
    }

    const emailVerification = await db.emailVerification.create({
      data: { accountId: params.accountId },
    })

    await email.sendVerificationEmail({
      recipients: [recipientEmail],
      verificationCode: emailVerification.code,
    })

    return true
  } catch (err) {
    console.error("Error sending verification email. Failed with err: ", err)
    return false
  }
}

export default sendVerificationEmail
