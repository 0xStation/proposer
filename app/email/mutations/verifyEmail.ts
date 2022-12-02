import { Account, AccountMetadata } from "app/account/types"
import db from "db"
import * as z from "zod"

const VerifyEmail = z.object({
  verificationCode: z.string(),
})

export default async function verifyEmail(input: z.infer<typeof VerifyEmail>) {
  try {
    const params = VerifyEmail.parse(input)
    const emailVerification = await db.emailVerification.findUnique({
      where: {
        code: params.verificationCode,
      },
      include: {
        account: true,
      },
    })

    if (!emailVerification) {
      return false
    }

    if ((emailVerification?.account as Account)?.data?.hasVerifiedEmail) {
      return true
    }

    await db.account.update({
      where: { id: emailVerification?.account.id },
      data: {
        data: {
          ...(emailVerification?.account.data as unknown as AccountMetadata),
          hasSavedEmail: true,
          hasVerifiedEmail: true,
        } as any,
      },
    })

    await db.emailVerification.deleteMany({ where: { accountId: emailVerification?.account.id } })
    return true
  } catch (err) {
    console.error("Error verifying email. Failed with err: ", err)
    return false
  }
}
