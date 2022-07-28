import db from "db"
import * as z from "zod"

// Change the end date to some later date to "reopen" it.
// note: need to send notification
const ReopenRfp = z.object({
  rfpId: z.string(),
  endDate: z.date().optional(),
})

export default async function reopenRfp(input: z.infer<typeof ReopenRfp>) {
  if (input.endDate && input.endDate < new Date()) {
    throw Error("End date cannot be in the past.")
  }

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
