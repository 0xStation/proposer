import * as z from "zod"
import db from "db"
import { Rfp, RfpMetadata } from "../types"

const UpdateRfpContent = z.object({
  rfpId: z.string(),
  title: z.string(),
  body: z.string(),
  oneLiner: z.string(),
  bodyPrefill: z.string().optional(),
  minWordCount: z.number().optional(),
})

export default async function updateRfpContent(input: z.infer<typeof UpdateRfpContent>) {
  const params = UpdateRfpContent.parse(input)
  try {
    // use $transaction to eliminate risk of race condition with changing other metadata
    // in edit form and waiting for new data to populate frontend state by just changing
    // token-gating metadata with fresh query on backend-side
    const rfp = await db.$transaction(async (db) => {
      const rfp = await db.rfp.findUnique({
        where: { id: params.rfpId },
        include: { template: true },
      })

      const rfpMetadata = {
        ...Object(rfp?.data),
        content: {
          title: params.title,
          body: params.body,
          oneLiner: params.oneLiner,
        },
        proposal: {
          ...(rfp?.data as RfpMetadata)?.proposal,
          body: {
            prefill: params.bodyPrefill,
            minWordCount: params.minWordCount,
          },
        },
      } as RfpMetadata

      const updatedRfp = await db.rfp.update({
        where: { id: params.rfpId },
        data: {
          data: rfpMetadata,
        },
        include: {
          template: true,
        },
      })

      return updatedRfp
    })

    return rfp as Rfp
  } catch (err) {
    console.error("Failed to update RFP content", err)
    throw err
  }
}
