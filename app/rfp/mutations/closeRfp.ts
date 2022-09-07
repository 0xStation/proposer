import db from "db"
import { Ctx } from "blitz"
import * as z from "zod"

// Change the end date to right now when the user closes an RFP.
// note: need to send notification
const CloseRfp = z.object({
  rfpId: z.string(),
})

export default async function closeRfp(input: z.infer<typeof CloseRfp>, ctx: Ctx) {
  const rfp = await db.rfp.findUnique({
    where: {
      id: input.rfpId,
    },
  })

  if (!rfp) {
    throw new Error("Cannot close rfp that does not exist.")
  }

  ctx.session.$authorize([rfp.authorAddress], [])

  try {
    const updatedRfp = await db.rfp.update({
      where: { id: input.rfpId },
      data: {
        endDate: new Date(),
      },
    })
    return updatedRfp
  } catch (error) {
    throw error
  }
}
