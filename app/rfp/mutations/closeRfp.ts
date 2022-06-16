import db from "db"
import * as z from "zod"

// Change the end date to right now when the user closes an RFP.
// note: need to send notification
const CloseRfp = z.object({
  rfpId: z.string(),
})

export default async function closeRfp(input: z.infer<typeof CloseRfp>) {
  const existingRfp = await db.rfp.findUnique({
    where: {
      id: input.rfpId,
    },
  })

  if (!existingRfp) {
    console.error(`An RFP with localId ${input.rfpId} does not exist.`)
    return null
  }

  const rfp = await db.rfp.update({
    where: { id: input.rfpId },
    data: {
      endDate: new Date(),
    },
  })

  return rfp
}
