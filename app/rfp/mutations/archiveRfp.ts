import db from "db"
import * as z from "zod"
import { RfpStatus as PrismaRfpStatus } from "@prisma/client"

// sets status to "archive" -- DOES NOT ACTUALLY DELETE FROM DB
// note: need to send notification
const ArchiveRfp = z.object({
  rfpId: z.string(),
})

export default async function archiveRfp(input: z.infer<typeof ArchiveRfp>) {
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
      status: PrismaRfpStatus.ARCHIVED,
    },
  })

  return rfp
}
