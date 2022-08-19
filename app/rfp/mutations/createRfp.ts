import db from "db"
import * as z from "zod"
import { RfpStatus as PrismaRfpStatus } from "@prisma/client"
import { TokenTag, Token } from "types"
import { FundingSenderType } from "app/types"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { RfpMetadata } from "../types"
import { TagTokenMetadata } from "app/tag/types"

const CreateRfp = z.object({
  terminalId: z.number(),
  authorAddress: z.string(),
  fundingAddress: z.string().optional(),
  contentTitle: z.string(),
  contentBody: z.string(),
  startDate: z.date(),
  endDate: z.date().optional(),
  fundingToken: Token,
  fundingBudgetAmount: z.string(),
  signature: z.string(),
  signatureMessage: z.any(),
  submittingPermission: TokenTag.optional(),
  viewingPermission: TokenTag.optional(),
})

const defaultProposalPrefillBody = `
  # Proposal summary\n\n
  # Goals\n\n
  # Roadmap and deliverable details\n\n
  # Challenges\n\n
  # Team background and previous contributions\n\n
  # Support request\n\n
`

export default async function createRfp(input: z.infer<typeof CreateRfp>) {
  const params = CreateRfp.parse(input)

  if (params.endDate) {
    if (params.startDate > params.endDate) {
      throw new Error("end date cannot come before start date")
    }
  }

  // prepare metadata object for compiler checks
  const rfpMetadata: RfpMetadata = {
    content: {
      title: params.contentTitle,
      body: params.contentBody,
    },
    signature: params.signature,
    publishSignature: {
      address: toChecksumAddress(params.authorAddress),
      signature: params.signature,
      message: params.signatureMessage,
      timestamp: new Date(),
    },
    proposalPrefill: {
      body: defaultProposalPrefillBody,
    },
    funding: {
      token: {
        ...input.fundingToken,
        address: toChecksumAddress(input.fundingToken.address),
      },
      budgetAmount: params.fundingBudgetAmount,
      ...(params.fundingAddress !== "" && {
        senderAddress: params.fundingAddress ? toChecksumAddress(params.fundingAddress) : undefined,
        senderType: FundingSenderType.CHECKBOOK,
      }),
    },
    permissions: {
      submit: input.submittingPermission as TagTokenMetadata,
      view: input.viewingPermission as TagTokenMetadata,
    },
  }

  const rfp = await db.rfp.create({
    data: {
      authorAddress: params.authorAddress,
      terminalId: params.terminalId,
      startDate: params.startDate,
      ...(params.endDate && { endDate: params.endDate }),
      status: PrismaRfpStatus.PUBLISHED,
      data: JSON.parse(JSON.stringify(rfpMetadata)),
    },
  })

  return rfp
}
