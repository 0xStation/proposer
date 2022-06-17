import db from "db"
import * as z from "zod"

// Change the end date to right now when the user closes an RFP.
// note: need to send notification
const CloseRfp = z.object({
  rfpId: z.string(),
})

export default async function closeRfp(input: z.infer<typeof CloseRfp>) {
  try {
    const rfp = await db.rfp.update({
      where: { id: input.rfpId },
      data: {
        endDate: new Date(),
      },
    })
    return rfp
  } catch (error) {
    throw error
  }
}
