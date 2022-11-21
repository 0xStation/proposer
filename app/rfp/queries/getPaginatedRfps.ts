import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import db, { Prisma, RfpStatus } from "db"

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
        where: { status: RfpStatus.OPEN, suppress: false },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          template: true,
          account: true,
          _count: {
            select: { proposals: true },
          },
        },
      }),
  })

  return {
    rfps,
    nextPage,
    hasMore,
    count,
  }
})
