import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import db, { Prisma, ProposalStatus, RfpStatus } from "db"
import { Rfp } from "../types"
import { getRfpStatus } from "../utils"

interface GetPaginatedRfpsInput
  extends Pick<Prisma.RfpFindManyArgs, "include" | "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(async ({ where, skip = 0, take = 100 }: GetPaginatedRfpsInput) => {
  const {
    items: rfps,
    hasMore,
    nextPage,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.rfp.count({ where }),
    query: (paginateArgs) =>
      db.rfp.findMany({
        ...paginateArgs,
        where: { status: { not: RfpStatus.CLOSED }, suppress: false },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          template: true,
          account: true,
          proposals: {
            where: {
              suppress: false,
              deleted: false,
            },
          },
        },
      }),
  })

  return {
    rfps: rfps.map((rfp) => {
      return {
        ...rfp,
        status: getRfpStatus(rfp.status, rfp.startDate, rfp.endDate),
        _count: { proposals: rfp.proposals.length },
      }
    }) as unknown as Rfp[],
    nextPage,
    hasMore,
    count,
  }
})
