import db, { AddressType } from "db"
import * as z from "zod"
import { Ctx } from "blitz"
import { Account } from "../types"
import { getEmail, saveEmail } from "app/utils/privy"
import sendVerificationEmail from "app/email/mutations/sendVerificationEmail"
import { getGnosisSafeDetails } from "app/utils/getGnosisSafeDetails"

const UpdateAccount = z.object({
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
})

export default async function updateAccount(input: z.infer<typeof UpdateAccount>, ctx: Ctx) {
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

  // if account is SAFE, add signer addresses as valid authorization
  let validAddresses = []
  if (existingAccount.addressType === AddressType.SAFE) {
    const safeDetails = await getGnosisSafeDetails(
      existingAccount.data.chainId!,
      existingAccount.address!
    )
    validAddresses = safeDetails?.signers || []
  }

  ctx.session.$authorize(validAddresses, [existingAccount.id])

  let hasVerifiedEmail = false
  const existingEmail = await getEmail(params.address as string)
  if (params.email && params.email === existingEmail) {
    hasVerifiedEmail = !!existingAccount?.data?.hasVerifiedEmail
  } else {
    // store email with Privy so it does not live in our database to reduce leakage risk
    // not in try-catch to handle errors on client
    // allows saving if no email provided as the removal mechanism while Privy's delete API in development
    const email = await saveEmail(params.address as string, params.email || "")

    if (params.email && email) {
      await sendVerificationEmail({ accountId: existingAccount.id })
    }
  }

  const payload = {
    address: params.address,
    data: {
      // save existing account data with overwrites below
      // without this, chainId for multisig accounts gets wiped
      ...existingAccount.data,
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
    // include pinned workspaces so they don't disappear on account on update
    include: {
      originsOf: {
        include: {
          targetAccount: true,
        },
      },
    },
  })

  return account as Account
}
