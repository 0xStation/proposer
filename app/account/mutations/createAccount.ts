import db from "db"
import * as z from "zod"
import { Ctx } from "blitz"
import { Account } from "../types"
import { saveEmail } from "app/utils/privy"

const CreateAccount = z.object({
  name: z.string().optional(),
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
  createSession: z.boolean().optional(),
})

export default async function createAccount(input: z.infer<typeof CreateAccount>, ctx: Ctx) {
  const params = CreateAccount.parse(input)

  // store email with Privy so it does not live in our database to reduce leakage risk
  if (!!params.email) {
    await saveEmail(params.address as string, params.email)
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
    },
  }

  const account = await db.account.create({
    data: payload,
  })

  if (account && account.id && params.createSession) {
    // create an authenticated session
    try {
      await ctx.session.$create({ userId: account.id })
    } catch (err) {
      console.error("Could not create an authenticated session. Failed with err: ", err)
    }
  }

  return account as Account
}
