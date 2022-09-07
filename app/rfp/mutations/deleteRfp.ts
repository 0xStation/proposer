import db from "db"
import { Ctx } from "blitz"
import * as z from "zod"
import { RfpStatus as PrismaRfpStatus } from "@prisma/client"

// sets status to "DELETED" -- DOES NOT ACTUALLY DELETE FROM DB
// note: need to send notification
const DeleteRfp = z.object({
  rfpId: z.string(),
})

export default async function deleteRfp(input: z.infer<typeof DeleteRfp>, ctx: Ctx) {
  const rfp = await db.rfp.findUnique({
    where: {
      id: input.rfpId,
    },
  })

  if (!rfp) {
    throw new Error("Cannot delete rfp that does not exist.")
  }

  ctx.session.$authorize([rfp.authorAddress], [])

  try {
    const rfp = await db.rfp.update({
      where: { id: input.rfpId },
      data: {
        status: PrismaRfpStatus.DELETED,
      },
    })

    return rfp
  } catch (error) {
    throw error
  }
}
