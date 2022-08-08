import db from "db"
import * as z from "zod"
import { Token, TokenTag } from "types"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { FundingSenderType } from "app/types"
import { RfpMetadata } from "../types"

// going to be calling this from edit RFP page, so we will still be passing in all of these data
// just bc they might not be changed does not mean we will be omitting them, because the form
// will still be capturing them while they are filled in for the edit view.
const UpdateRfp = z.object({
  rfpId: z.string(),
  contentTitle: z.string(),
  contentBody: z.string(),
  startDate: z.date(),
  endDate: z.date().nullable(),
  authorAddress: z.string(),
  fundingAddress: z.string().optional(),
  fundingToken: Token,
  fundingBudgetAmount: z.string(),
  signature: z.string(),
  submittingPermission: TokenTag.optional(),
  viewingPermission: TokenTag.optional(),
  signatureMessage: z.any().optional(),
  proposalPrefillBody: z.string(),
})

export default async function updateRfp(input: z.infer<typeof UpdateRfp>) {
  const params = UpdateRfp.parse(input)

  // prepare metadata object for compiler checks
  const rfpMetadata: RfpMetadata = {
    content: {
      title: params.contentTitle,
      body: params.contentBody,
    },
    signature: params.signature,
    publishSignature: {
      address: params.authorAddress,
      signature: params.signature,
      message: params.signatureMessage,
      timestamp: new Date(),
    },
    proposalPrefill: {
      body: params.proposalPrefillBody,
    },
    funding: {
      token: {
        ...input.fundingToken,
        address: toChecksumAddress(input.fundingToken.address),
      },
      budgetAmount: params.fundingBudgetAmount,
      ...(params.fundingAddress !== "" && {
        senderAddress: params.fundingAddress,
        senderType: FundingSenderType.CHECKBOOK,
      }),
    },
    permissions: {
      submit: input.submittingPermission,
      view: input.viewingPermission,
    },
  }

  try {
    const rfp = await db.rfp.update({
      where: { id: input.rfpId },
      data: {
        startDate: input.startDate,
        endDate: input.endDate,
        data: JSON.parse(JSON.stringify(rfpMetadata)),
      },
    })

    return rfp
  } catch (error) {
    throw error
  }
}
