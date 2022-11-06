import * as z from "zod"
import db from "db"
import { Rfp, RfpMetadata } from "../types"
import { ZodToken } from "../../types/zod"

const UpdateRfpRequiredToken = z.object({
  rfpId: z.string(),
  singleTokenGate: z
    .object({
      token: ZodToken,
      minBalance: z.string(), // string to pass directly into BigNumber.from in logic check
    })
    .optional(),
})

export default async function updateRfpRequiredToken(
  input: z.infer<typeof UpdateRfpRequiredToken>
) {
  const params = UpdateRfpRequiredToken.parse(input)
  try {
    const rfp = await db.$transaction(async (db) => {
      const rfp = await db.rfp.findUnique({
        where: { id: params.rfpId },
      })

      const metadata = {
        ...Object(rfp?.data),
        singleTokenGate: params.singleTokenGate,
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
