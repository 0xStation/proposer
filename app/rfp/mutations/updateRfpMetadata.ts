import * as z from "zod"
import db from "db"
import { Rfp } from "../types"
import { ZodToken } from "../../types/zod"

const UpdateRfpMetadata = z.object({
  rfpId: z.string(),
  status: z.string(),
  title: z.string(),
  body: z.string(),
  oneLiner: z.string(),
  submissionGuideline: z.string().optional(),
  token: ZodToken,
  minBalance: z.string().optional(), // string to pass directly into BigNumber.from in logic check
})

export default async function updateRfpMetadata(input: z.infer<typeof UpdateRfpMetadata>) {
  const params = UpdateRfpMetadata.parse(input)
  try {
    const rfp = await db.rfp.update({
      where: { id: params.rfpId },
      data: {
        data: {
          content: {
            title: params.title,
            body: params.body,
            oneLiner: params.oneLiner,
            submissionGuideline: params.submissionGuideline,
          },
          singleTokenGate: {
            token: params.token,
            minBalance: params.minBalance, // string to pass directly into BigNumber.from in logic check
          },
        },
      },
    })

    return rfp as Rfp
  } catch (err) {
    console.error(`Failed to close RFP ${params.status}`, err)
    throw err
  }
}
