import db from "db"
import * as z from "zod"
import { ZodToken, Token } from "app/types/token"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { RfpMetadata } from "../types"
import { deepCopy } from "app/core/utils/deepCopy"

// going to be calling this from edit RFP page, so we will still be passing in all of these data
// just bc they might not be changed does not mean we will be omitting them, because the form
// will still be capturing them while they are filled in for the edit view.
const UpdateRfp = z.object({
  rfpId: z.string(), // uuid as string?
  fundingAddress: z.string(),
  contentTitle: z.string(),
  contentBody: z.string(),
  startDate: z.date(),
  endDate: z.date().nullable(),
  fundingToken: ZodToken,
  fundingBudgetAmount: z.string(),
  signature: z.string(),
  submittingPermission: ZodToken.optional(),
  viewingPermission: ZodToken.optional(),
  signatureMessage: z.any().optional(),
  proposalPrefillBody: z.string(),
})

export default async function updateRfp(input: z.infer<typeof UpdateRfp>) {
  const params = UpdateRfp.parse(input)

  // prepare metadata object for compiler checks
  const metadata: RfpMetadata = {
    content: {
      title: params.contentTitle,
      body: params.contentBody,
    },
    signature: params.signature,
    signatureMessage: params.signatureMessage,
    proposalPrefill: {
      body: params.proposalPrefillBody,
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

  try {
    const rfp = await db.rfp.update({
      where: { id: params.rfpId },
      data: {
        fundingAddress: params.fundingAddress,
        startDate: params.startDate,
        endDate: params.endDate,
        data: deepCopy(metadata),
      },
    })

    return rfp
  } catch (error) {
    throw error
  }
}
