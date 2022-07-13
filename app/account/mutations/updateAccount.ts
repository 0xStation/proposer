import db from "db"
import * as z from "zod"
import { Account, AccountMetadata } from "../types"
import { saveEmail } from "app/utils/privy"

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
})

export default async function updateAccount(input: z.infer<typeof UpdateAccount>) {
  const params = UpdateAccount.parse(input)

  const existingAccount = await db.account.findUnique({
    where: {
      address: params.address,
    },
  })

  if (!existingAccount) {
    console.error("cannot update an account that does not exist")
    return null
  }

  // store email with Privy so it does not live in our database to reduce leakage risk
  if (
    (existingAccount.data as AccountMetadata).hasSavedEmail ||
    // if no saved email yet, only save if email was provided
    (!(existingAccount.data as AccountMetadata).hasSavedEmail && !!params.email)
  ) {
    await saveEmail(params.address as string, params.email || "")
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
      // TODO: if email was saved with a new value, set hasVerifiedEmail to false
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
