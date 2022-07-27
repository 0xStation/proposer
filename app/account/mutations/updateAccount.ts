import db from "db"
import * as z from "zod"
import { Account } from "../types"
import { getEmail, saveEmail } from "app/utils/privy"
import sendVerificationEmail from "app/email/mutations/sendVerificationEmail"

const UpdateAccount = z.object({
  name: z.string(),
  address: z.string().optional(),
  bio: z.string().optional(),
  email: z.string().optional(),
  pfpURL: z.string().optional(),
  coverURL: z.string().optional(),
  contactURL: z.string().optional(),
  twitterUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  hasVerifiedEmail: z.boolean().optional(),
})

export default async function updateAccount(input: z.infer<typeof UpdateAccount>) {
  const params = UpdateAccount.parse(input)

  const existingAccount = (await db.account.findUnique({
    where: {
      address: params.address,
    },
  })) as Account

  if (!existingAccount) {
    console.error("cannot update an account that does not exist")
    return null
  }

  let hasVerifiedEmail = false

  const existingEmail = await getEmail(params.address as string)
  // if email was saved with a new value, set `hasVerifiedEmail` to false
  if (params.email && params.email === existingEmail) {
    hasVerifiedEmail = !!existingAccount?.data?.hasVerifiedEmail
  } else {
    // store email with Privy so it does not live in our database to reduce leakage risk
    // not in try-catch to handle errors on client
    // allows saving if no email provided as the removal mechanism while Privy's delete API in development
    await saveEmail(params.address as string, params.email || "")
    if (params.email) {
      await sendVerificationEmail({ accountId: existingAccount.id })
    }
  }

  const payload = {
    address: params.address,
    data: {
      name: params.name,
      bio: params.bio,
      pfpURL: params.pfpURL,
      coverURL: params.coverURL,
      contactURL: params.contactURL,
      twitterUrl: params.twitterUrl,
      githubUrl: params.githubUrl,
      tiktokUrl: params.tiktokUrl,
      instagramUrl: params.instagramUrl,
      // mark email as saved for this account to not show email input modals
      hasSavedEmail: !!params.email,
      hasVerifiedEmail,
    },
  }

  const account = await db.account.upsert({
    where: {
      address: params.address,
    },
    update: payload,
    create: payload,
  })

  return account as Account
}
