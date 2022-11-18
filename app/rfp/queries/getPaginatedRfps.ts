import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import db, { Prisma } from "db"

interface GetPaginatedRfpsInput
  extends Pick<Prisma.RfpFindManyArgs, "include" | "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  async ({ include, where, orderBy, skip = 0, take = 100 }: GetPaginatedRfpsInput) => {
    const {
      items: rfps,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.rfp.count({ where }),
      query: (paginateArgs) => db.rfp.findMany({ ...paginateArgs, include, where, orderBy }),
    })

    return {
      rfps,
      nextPage,
      hasMore,
      count,
    }
  }
)
