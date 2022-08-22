import db from "db"
import * as z from "zod"
import { RfpStatus as PrismaRfpStatus } from "@prisma/client"
import { ZodToken } from "app/types/token"
import { toChecksumAddress } from "app/core/utils/checksumAddress"

const CreateRfp = z.object({
  terminalId: z.number(),
  fundingAddress: z.string(),
  authorAddress: z.string(),
  contentTitle: z.string(),
  contentBody: z.string(),
  startDate: z.date(),
  endDate: z.date().optional(),
  fundingToken: ZodToken,
  fundingBudgetAmount: z.string(),
  signature: z.string(),
  signatureMessage: z.any(),
  submittingPermission: ZodToken.optional(),
  viewingPermission: ZodToken.optional(),
})

const defaultProposalPrefill =
  "# Proposal summary \n\n # Goals \n\n # Roadmap and deliverable details \n\n # Challenges \n\n # Team background and previous contributions \n\n # Support request"

export default async function createRfp(input: z.infer<typeof CreateRfp>) {
  const params = CreateRfp.parse(input)

  if (params.endDate) {
    if (params.startDate > params.endDate) {
      throw new Error("end date cannot come before start date")
    }
  }

  const rfp = await db.rfp.create({
    data: {
      fundingAddress: params.fundingAddress,
      authorAddress: params.authorAddress,
      terminalId: params.terminalId,
      startDate: params.startDate,
      ...(params.endDate && { endDate: params.endDate }),
      status: PrismaRfpStatus.PUBLISHED,
      data: {
        content: {
          title: params.contentTitle,
          body: params.contentBody,
        },
        signature: params.signature,
        signatureMessage: params.signatureMessage,
        proposalPrefill: defaultProposalPrefill,
        funding: {
          token: {
            ...input.fundingToken,
            address: toChecksumAddress(input.fundingToken.address),
          },
          budgetAmount: params.fundingBudgetAmount,
        },
        permissions: {
          submit: input.submittingPermission,
          view: input.viewingPermission,
        },
      },
    },
  })

  return rfp
}
