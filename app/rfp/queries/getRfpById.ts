import db from "db"
import * as z from "zod"
import { Rfp } from "../types"
import { computeRfpProductStatus } from "../utils"
import { ProposalStatus as PrismaProposalStatus } from "@prisma/client"

const GetRfpById = z.object({
  id: z.string(),
})

export default async function getRfpById(input: z.infer<typeof GetRfpById>) {
  const rfp = await db.rfp.findUnique({
    where: {
      id: input.id,
    },
    include: {
      terminal: true,
      author: true,
      checkbook: true,
      proposals: {
        where: {
          status: {
            not: PrismaProposalStatus.DELETED,
          },
        },
      },
    },
  })

  if (!rfp) {
    return null
  }

  const signers = await db.account.findMany({
    where: {
      address: {
        in: rfp.checkbook?.signers || [],
      },
    },
  })

  return {
    ...rfp,
    checkbook: {
      ...rfp.checkbook,
      signerAccounts: signers,
    },
    status: computeRfpProductStatus(rfp.status, rfp.startDate, rfp.endDate),
    submissionCount: rfp.proposals.length,
  } as unknown as Rfp
}
