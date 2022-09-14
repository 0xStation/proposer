import db, { AddressType } from "db"
import * as z from "zod"
import { Ctx } from "blitz"
import { Account } from "../types"
import { saveEmail } from "app/utils/privy"
import sendVerificationEmail from "app/email/mutations/sendVerificationEmail"
import { getAddressType } from "app/utils/getAddressType"
import truncateString from "app/core/utils/truncateString"

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
  // not in try-catch to handle errors on client
  if (!!params.email) {
    await saveEmail(params.address as string, params.email)
  }

  let addressType
  let multisigChainId
  if (params.address) {
    const { addressType: type, chainId } = await getAddressType(params.address)
    addressType = type
    multisigChainId = chainId
  }

  const name = params.name

  const payload = {
    address: params.address,
    addressType,
    data: {
      name: name,
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
      // if this address is not a wallet, it is a smart contract so add its chainId
      ...(addressType !== AddressType.WALLET && { chainId: multisigChainId }),
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

  if (!!params.email) {
    await sendVerificationEmail({ accountId: account.id })
  }

  return account as Account
}
