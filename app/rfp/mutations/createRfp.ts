import db from "db"
import * as z from "zod"
import { RfpStatus as PrismaRfpStatus } from "@prisma/client"
import { ZodToken, Token } from "app/types/token"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { RfpMetadata } from "../types"
import { PROPOSAL_TEMPLATE_PREFILL } from "app/core/utils/constants"
import { deepCopy } from "app/core/utils/deepCopy"

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

export default async function createRfp(input: z.infer<typeof CreateRfp>) {
  const params = CreateRfp.parse(input)

  if (params.endDate) {
    if (params.startDate > params.endDate) {
      throw new Error("end date cannot come before start date")
    }
  }

  // prepare metadata object for compiler checks
  const metadata: RfpMetadata = {
    content: {
      title: params.contentTitle,
      body: params.contentBody,
    },
    signature: params.signature,
    signatureMessage: params.signatureMessage,
    proposalPrefill: {
      body: PROPOSAL_TEMPLATE_PREFILL.DEFAULT,
    },
    funding: {
      token: {
        ...params.fundingToken,
        address: toChecksumAddress(params.fundingToken.address),
      },
      budgetAmount: params.fundingBudgetAmount,
    },
    permissions: {
      submit: params.submittingPermission as Token,
      view: params.viewingPermission as Token,
    },
  }

  const rfp = await db.rfp.create({
    data: {
      fundingAddress: params.fundingAddress,
      authorAddress: params.authorAddress,
      terminalId: params.terminalId,
      startDate: params.startDate,
      ...(params.endDate && { endDate: params.endDate }),
      status: PrismaRfpStatus.PUBLISHED,
      data: deepCopy(metadata),
    },
  })

  return rfp
}
