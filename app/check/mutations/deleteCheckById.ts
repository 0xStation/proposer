import * as z from "zod"
import db from "db"
import { Ctx } from "blitz"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { invoke } from "@blitzjs/rpc"
import getSafeMetadata from "app/account/queries/getSafeMetadata"

const DeleteCheckById = z.object({
  checkId: z.string(),
  safeAddress: z.string(),
  chainId: z.number(),
})

export default async function deleteCheckById(input: z.infer<typeof DeleteCheckById>, ctx: Ctx) {
  const params = DeleteCheckById.parse(input)

  const safeMetadata = await invoke(getSafeMetadata, {
    address: params.safeAddress,
    chainId: params.chainId,
  })

  const userIsWorkspaceSigner = safeMetadata?.signers.some((signer) =>
    addressesAreEqual(ctx.session?.siwe?.address, signer)
  )

  if (!userIsWorkspaceSigner) {
    throw Error("Unauthorized: user is not a signer.")
  }

  await db.check.delete({
    where: {
      id: params.checkId,
    },
  })

  return true
}
