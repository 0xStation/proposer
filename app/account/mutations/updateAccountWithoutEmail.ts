import db, { AddressType } from "db"
import * as z from "zod"
import { Ctx } from "blitz"
import { Account } from "../types"
import { getGnosisSafeDetails } from "app/utils/getGnosisSafeDetails"

const UpdateAccountWithoutEmail = z.object({
  address: z.string(),
  discordId: z.string().optional(),
  name: z.string().optional(),
  bio: z.string().optional(),
  pfpUrl: z.string().optional(),
  discordHandle: z.string().optional(),
})

export default async function updateAccountWithoutEmail(
  input: z.infer<typeof UpdateAccountWithoutEmail>,
  ctx: Ctx
) {
  const params = UpdateAccountWithoutEmail.parse(input)

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

  const payload = {
    address: params.address,
    addressType: existingAccount.addressType,
    discordId: params.discordId,
    data: {
      // save existing account data with overwrites below
      // without this, chainId for multisig accounts gets wiped
      ...Object(existingAccount.data),
      name: params.name,
      bio: params.bio,
      pfpUrl: params.pfpUrl,
      discordHandle: params.discordHandle,
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
