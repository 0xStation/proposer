import * as z from "zod"
import { getEmail } from "app/utils/privy"
import { Ctx } from "blitz"
import { invoke } from "@blitzjs/rpc"
import getSafeMetadata from "./getSafeMetadata"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"

const GetAccountEmail = z.object({
  address: z.string(),
  chainId: z.number().optional(),
})

export default async function getAccountEmail(input: z.infer<typeof GetAccountEmail>, ctx: Ctx) {
  const params = GetAccountEmail.parse(input)

  if (params.chainId) {
    const safeMetadata = await invoke(getSafeMetadata, {
      address: params.address,
      chainId: params.chainId,
    })

    const userIsWorkspaceSigner = safeMetadata?.signers.some((signer) =>
      addressesAreEqual(ctx.session?.siwe?.address, signer)
    )

    if (!userIsWorkspaceSigner) {
      throw Error("Unauthorized: account is a safe, but connected account is not a signer.")
    }
  } else {
    // can only fetch email if calling from SIWE auth'd session of self
    ctx.session.$authorize([params.address], [])
  }

  // storing email with Privy, not our database, so we need to fetch it directly
  const email = await getEmail(params.address)

  return email || ""
}
