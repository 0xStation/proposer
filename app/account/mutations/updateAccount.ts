import db from "db"
import * as z from "zod"
import { Account } from "../types"

const UpdateAccount = z.object({
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

  const account = await db.account.update({
    where: {
      address: params.address,
    },
    data: payload,
  })

  return account as Account
}
