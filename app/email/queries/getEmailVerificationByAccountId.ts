import db from "db"
import * as z from "zod"

const GetEmailVerificationByAccountId = z.object({
  accountId: z.number(),
})

export default async function getEmailVerificationByAccountId(
  input: z.infer<typeof GetEmailVerificationByAccountId>
) {
  try {
    const params = GetEmailVerificationByAccountId.parse(input)
    const emailVerification = await db.emailVerification.findUnique({
      where: {
        accountId: params.accountId,
      },
    })

    if (!emailVerification) {
      return null
    }

    return emailVerification
  } catch (err) {
    console.error("Error fetching email verification. Failed with err: ", err)
    return null
  }
}
