import * as z from "zod"
import db from "db"
import { Rfp, RfpMetadata, SocialConnection } from "../types"
import { ZodToken } from "../../types/zod"

const UpdateRfpRequirements = z.object({
  rfpId: z.string(),
  singleTokenGate: z
    .object({
      token: ZodToken,
      minBalance: z.string(), // string to pass directly into BigNumber.from in logic check
    })
    .optional(),
  requiredSocialConnections: z
    .enum([
      SocialConnection.DISCORD,
      SocialConnection.TWITTER,
      SocialConnection.GITHUB,
      SocialConnection.FARCASTER,
      SocialConnection.LENS,
    ])
    .array(),
})

export default async function updateRfpRequirements(input: z.infer<typeof UpdateRfpRequirements>) {
  const params = UpdateRfpRequirements.parse(input)
  try {
    // use $transaction to eliminate risk of race condition with changing other metadata
    // in edit form and waiting for new data to populate frontend state by just changing
    // token-gating metadata with fresh query on backend-side
    const rfp = await db.$transaction(async (db) => {
      const rfp = await db.rfp.findUnique({
        where: { id: params.rfpId },
      })

      const metadata = {
        ...Object(rfp?.data),
        singleTokenGate: params.singleTokenGate,
        requiredSocialConnections: params.requiredSocialConnections,
      } as RfpMetadata

      const updatedRfp = await db.rfp.update({
        where: { id: params.rfpId },
        data: {
          data: metadata,
        },
      })

      return updatedRfp
    })

    return rfp as Rfp
  } catch (err) {
    console.error(`Failed to update RFP required token ${params.singleTokenGate}`, err)
    throw err
  }
}
