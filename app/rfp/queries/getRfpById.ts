import db from "db"
import * as z from "zod"
import { computeRfpProductStatus } from "../utils"

const GetRfpById = z.object({
  id: z.string(),
})

export default async function getRfpById(input: z.infer<typeof GetRfpById>) {
  const rfp = await db.rfp.findUnique({
    where: {
      id: input.id,
    },
    include: {
      _count: {
        select: { proposals: true },
      },
    },
  })

  if (!rfp) {
    return null
  }

  return {
    ...rfp,
    status: computeRfpProductStatus(rfp.status, rfp.startDate, rfp.endDate),
    submissionCount: rfp._count.proposals,
  }
}
