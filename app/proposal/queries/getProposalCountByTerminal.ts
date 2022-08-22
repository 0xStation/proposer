import db from "db"
import * as z from "zod"
import { ProposalStatus as PrismaProposalStatus } from "@prisma/client"
import { RfpStatus as PrismaRfpStatus } from "@prisma/client"

const GetProposalCountByTerminal = z.object({
  terminalId: z.number(),
})

export const getProposalCountByTerminal = async (
  input: z.infer<typeof GetProposalCountByTerminal>
) => {
  const params = GetProposalCountByTerminal.parse(input)
  try {
    const rfpIds = await db.rfp.findMany({
      where: {
        terminalId: params.terminalId,
        NOT: [
          {
            status: PrismaRfpStatus.DELETED,
          },
        ],
      },
      select: { id: true },
    })

    const proposalCount = await db.proposal.count({
      where: {
        rfpId: {
          in: rfpIds.map((obj) => obj.id),
        },
        NOT: [
          {
            status: PrismaProposalStatus.DELETED,
          },
        ],
      },
    })

    return proposalCount as number
  } catch (err) {
    console.error("Error fetching proposal count. Failed with error: ", err)
    return 0
  }
}

export default getProposalCountByTerminal
