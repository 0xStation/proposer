import db from "db"
import * as z from "zod"
import { computeStatus } from "../utils"

const GetRfpById = z.object({
  multisigAddress: z.string(),
  localId: z.number(),
})

export default async function getRfpsByMultisigAddress(input: z.infer<typeof GetRfpById>) {
  const rfps = await db.rfp.findMany({
    where: {
      parentMultisig: input.multisigAddress,
      localId: input.localId,
    },
    include: {
      _count: {
        select: { proposals: true },
      },
    },
  })

  return rfps.map((rfp) => {
    return {
      ...rfp,
      status: computeStatus(rfp.status, rfp.startDate, rfp.endDate),
      submissionCount: rfp._count.proposals,
    }
  })
}
