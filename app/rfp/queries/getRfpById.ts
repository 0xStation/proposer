import db from "db"
import * as z from "zod"
import { Rfp } from "../types"
import { computeRfpProductStatus } from "../utils"

const GetRfpById = z.object({
  id: z.string(),
})

export default async function getRfpById(input: z.infer<typeof GetRfpById>) {
  const params = GetRfpById.parse(input)

  const rfp = await db.rfp.findUnique({
    where: {
      id: params.id,
    },
    include: {
      terminal: true,
      author: true,
      // _count: {
      //   select: { proposals: true },
      // },
    },
  })

  if (!rfp) {
    return null
  }

  return {
    ...rfp,
    status: computeRfpProductStatus(rfp.status, rfp.startDate, rfp.endDate),
    submissionCount: 0, //rfp._count.proposals,
  } as unknown as Rfp
}
