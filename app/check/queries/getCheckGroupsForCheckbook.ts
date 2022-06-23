import { Decimal } from "@prisma/client/runtime"
import db from "db"
import * as z from "zod"

const GetCheckGroupsForCheckbook = z.object({
  checkbookAddress: z.string(),
  tokenAddress: z.string(),
})

export default async function getCheckGroupsForCheckbook(
  input: z.infer<typeof GetCheckGroupsForCheckbook>
) {
  const pending = await db.check.aggregate({
    where: {
      fundingAddress: input.checkbookAddress,
      tokenAddress: input.tokenAddress,
      txnHash: {
        equals: null,
      },
      // add approval count > quorum here
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
    pending: pending._sum.tokenAmount || "0",
    cashed: cashed._sum.tokenAmount || "0",
  } as { pending: Decimal; cashed: Decimal }
}
