import db from "db"
import * as z from "zod"
import { RfpStatus as PrismaRfpStatus } from "@prisma/client"

// sets status to "DELETED" -- DOES NOT ACTUALLY DELETE FROM DB
// note: need to send notification
const DeleteRfp = z.object({
  rfpId: z.string(),
})

export default async function deleteRfp(input: z.infer<typeof DeleteRfp>) {
  try {
    const rfp = await db.rfp.update({
      where: { id: input.rfpId },
      data: {
        status: PrismaRfpStatus.DELETED,
      },
    })

    return rfp
  } catch (error) {
    return error
  }
}
