import db from "db"
import * as z from "zod"
import { statusToFilter, computeStatus } from "../utils"

const GetRfpsByMultisigAddress = z.object({
  multisigAddress: z.string(),
  status: z.string().optional(),
})

export default async function getRfpsByMultisigAddress(
  input: z.infer<typeof GetRfpsByMultisigAddress>
) {
  const rfps = await db.rfp.findMany({
    where: {
      parentMultisig: input.multisigAddress,
      ...(input.status && statusToFilter(input.status)),
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
