import db, { Account } from "db"
import * as z from "zod"

const GetAccountByAddress = z.object({
  address: z.string(),
})

type AccountMetadata = {
  name: string
  handle: string
  pfpURL: string
  webURL: string
  githubURL: string
  twitterURL: string
  skills: string[]
  pronouns: string
  discord: string
  verified: boolean
}

export default async function getAccountByAddress(input: z.infer<typeof GetAccountByAddress>) {
  const data = GetAccountByAddress.parse(input)
  const account = await db.account.findFirst({ where: { address: data.address } })

  if (!account) {
    return null
  }

  return {
    ...account,
    ...(account.data as Object),
  } as Account & AccountMetadata
}
