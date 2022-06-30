import db from "db"
import * as z from "zod"

const GetPendingChecksByTerminal = z.object({
  terminalId: z.number(),
})

export default async function getPendingChecksByTerminal(
  input: z.infer<typeof GetPendingChecksByTerminal>
) {
  const checkbooks = await db.checkbook.findMany({ where: { terminalId: input.terminalId } })

  let obj = {}
  checkbooks.forEach((cb) => {
    if (!obj[cb.quorum]) {
      obj[cb.quorum] = [cb.address]
    } else {
      obj[cb.quorum] = [...obj[cb.quorum], cb.address]
    }
  })

  let pendingCheckIds: string[] = []

  for (const [quorum, checkbookAddresses] of Object.entries(obj)) {
    // get checks that have >= quorum approvals
    // only way to make a query of this nature is with groupBy
    const pendingChecksGroup = await db.checkApproval.groupBy({
      where: {
        check: {
          fundingAddress: {
            in: checkbookAddresses as string[],
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
            gte: parseInt(quorum),
          },
        },
      },
    })
    pendingCheckIds = [...pendingCheckIds, ...pendingChecksGroup.map((g) => g.checkId)]
  }

  const pendingChecks = await db.check.findMany({
    where: {
      id: {
        in: pendingCheckIds,
      },
    },
  })

  return pendingChecks
}
