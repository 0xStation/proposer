import db, { ProposalStatus, RfpStatus } from "db"
import * as z from "zod"
import { Rfp } from "../types"
import { computeRfpDbStatusFilter, getRfpStatus } from "../utils"

const GetRfpsForAccount = z.object({
  address: z.string(),
  page: z.number().optional().default(0),
  paginationTake: z.number().optional().default(25),
  statuses: z.enum([RfpStatus.OPEN, RfpStatus.CLOSED]).array().optional(),
})

export default async function getRfpsForAccount(input: z.infer<typeof GetRfpsForAccount>) {
  const params = GetRfpsForAccount.parse(input)

  const rfps = await db.rfp.findMany({
    where: {
      accountAddress: params.address,
      ...(params.statuses &&
        params.statuses.length > 0 && {
          OR: params.statuses.map((status) => computeRfpDbStatusFilter(status)),
        }),
    },
    include: {
      template: true,
      proposals: {
        where: {
          suppress: false,
          deleted: false,
        },
      },
    },
    take: input.paginationTake,
    skip: input.page * input.paginationTake,
    orderBy: {
      status: "asc", // jank way to sort so OPEN rfps are shown first, temp fix
    },
  })

  return rfps.map((rfp) => {
    return {
      ...rfp,
      status: getRfpStatus(rfp.status, rfp.startDate, rfp.endDate),
      _count: { proposals: rfp.proposals.length },
    }
  }) as unknown as Rfp[]
}
