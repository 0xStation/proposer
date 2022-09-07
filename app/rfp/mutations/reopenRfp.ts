import db from "db"
import { Ctx } from "blitz"
import * as z from "zod"

// Change the end date to some later date to "reopen" it.
// note: need to send notification
const ReopenRfp = z.object({
  rfpId: z.string(),
  endDate: z.date().optional(),
})

export default async function reopenRfp(input: z.infer<typeof ReopenRfp>, ctx: Ctx) {
  if (input.endDate && input.endDate < new Date()) {
    throw Error("End date cannot be in the past.")
  }

  const rfp = await db.rfp.findUnique({
    where: {
      id: input.rfpId,
    },
  })

  if (!rfp) {
    throw new Error("Cannot reopen rfp that does not exist.")
  }

  ctx.session.$authorize([rfp.authorAddress], [])

  try {
    const rfp = await db.rfp.update({
      where: { id: input.rfpId },
      data: {
        endDate: input.endDate,
      },
    })

    return rfp
  } catch (error) {
    throw error
  }
}
