import { Decimal } from "@prisma/client/runtime"
import db from "db"
import * as z from "zod"

const GetAggregatedCheckAmounts = z.object({
  checkbookAddress: z.string(),
  tokenAddress: z.string(),
  quorum: z.number(),
})

export default async function getAggregatedCheckAmounts(
  input: z.infer<typeof GetAggregatedCheckAmounts>
) {
  const params = GetAggregatedCheckAmounts.parse(input)

  // get checks that have >= quorum approvals
  // only way to make a query of this nature is with groupBy
  const approvedUncashedChecksGroup = await db.checkApproval.groupBy({
    where: {
      check: {
        fundingAddress: {
          equals: input.checkbookAddress,
        },
        tokenAddress: {
          equals: input.tokenAddress,
        },
        txnHash: {
          equals: null,
        },
      },
    },
    by: ["checkId"],
    having: {
      checkId: {
        _count: {
          gte: input.quorum,
        },
      },
    },
  })

  // flatten groupings to array of check ids
  const pendingCheckIds = approvedUncashedChecksGroup.map((g) => g.checkId)

  const pending = await db.check.aggregate({
    where: {
      id: {
        in: pendingCheckIds,
      },
    },
    _sum: {
      tokenAmount: true,
    },
  })

  const cashed = await db.check.aggregate({
    where: {
      fundingAddress: input.checkbookAddress,
      tokenAddress: input.tokenAddress,
      txnHash: {
        not: null,
      },
    },
    _sum: {
      tokenAmount: true,
    },
  })

  return {
    pending: pending._sum.tokenAmount || new Decimal(0),
    cashed: cashed._sum.tokenAmount || new Decimal(0),
  } as { pending: Decimal; cashed: Decimal }
}
