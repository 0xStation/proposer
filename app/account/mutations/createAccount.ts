import db from "db"
import * as z from "zod"
import { Ctx } from "blitz"
import { Account } from "../types"

const CreateAccount = z.object({
  name: z.string(),
  address: z.string().optional(),
  bio: z.string().optional(),
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
