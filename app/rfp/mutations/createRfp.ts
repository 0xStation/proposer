import db from "db"
import * as z from "zod"
import { RfpStatus as PrismaRfpStatus } from "@prisma/client"

const CreateRfp = z.object({
  terminalId: z.number(),
  fundingAddress: z.string(),
  authorAddress: z.string(),
  contentTitle: z.string(),
  contentBody: z.string(),
  startDate: z.date(),
  endDate: z.date().optional(),
  signature: z.string(),
})

const defaultProposalPrefill =
  "# Proposal summary \n\n # Goals \n\n # Roadmap and deliverable details \n\n # Challenges \n\n # Team background and previous contributions \n\n # Support request"

export default async function createRfp(input: z.infer<typeof CreateRfp>) {
  const rfp = await db.rfp.create({
    data: {
      fundingAddress: input.fundingAddress,
      authorAddress: input.authorAddress,
      terminalId: input.terminalId,
      startDate: input.startDate,
      ...(input.endDate && { endDate: input.endDate }),
      status: PrismaRfpStatus.PUBLISHED,
      data: {
        content: {
          title: input.contentTitle,
          body: input.contentBody,
        },
        signature: input.signature,
        proposalPrefill: defaultProposalPrefill,
      },
    },
  })

  return rfp
}
