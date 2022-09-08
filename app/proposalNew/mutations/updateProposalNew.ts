import db from "db"
import * as z from "zod"
import { OptionalZodToken } from "app/types/zod"
import { ProposalNewMetadata } from "../types"

const UpdateProposalNew = z.object({
  proposalId: z.string(),
  contentTitle: z.string(),
  contentBody: z.string(),
  contributorAddress: z.string(),
  token: OptionalZodToken,
  paymentAmount: z.string().optional(),
  ipfsHash: z.string().optional(),
  ipfsPinSize: z.number().optional(), // ipfs
  ipfsTimestamp: z.string().optional(),
  // paymentTermType: z.string().optional(),
  // advancedPaymentPercentage: z.number().optional(),
})

export default async function updateProposal(input: z.infer<typeof UpdateProposalNew>) {
  const params = UpdateProposalNew.parse(input)
  if (parseFloat(params.paymentAmount || "") < 0) {
    throw new Error("amount must be greater or equal to zero.")
  }

  const { ipfsHash, ipfsPinSize, ipfsTimestamp } = params
  const ipfsMetadata = {
    hash: ipfsHash,
    ipfsPinSize,
    timestamp: ipfsTimestamp,
  }

  const proposalMetadata = {
    content: {
      title: params.contentTitle,
      body: params.contentBody,
    },
    // if no payment amount we can infer that there is no payment requested
    // it might be better to pass this through more explicitly with a flag for "no funding"
    // but we are doing this the quick way with minimal infra
    // if we get validation this is good idea we can improve
    // if advancedPaymentPercentage is greater than 0, we need two milestones
    payments:
      // params.paymentAmount
      //   ? params.advancedPaymentPercentage && params.advancedPaymentPercentage > 0
      //     ? [
      //         {
      //           milestoneId: 0,
      //           recipientAddress: params.contributorAddress,
      //           token: params.token,
      //           amount: String(
      //             (Number(params.paymentAmount) * (params.advancedPaymentPercentage / 100)).toFixed(
      //               params.token.decimals
      //             )
      //           ),
      //         },
      //         {
      //           milestoneId: 1,
      //           recipientAddress: params.contributorAddress,
      //           token: params.token,
      //           amount: String(
      //             (
      //               Number(params.paymentAmount) *
      //               ((100 - params.advancedPaymentPercentage) / 100)
      //             ).toFixed(params.token.decimals)
      //           ),
      //         },
      //       ]
      //     :
      [
        {
          milestoneId: 0,
          recipientAddress: params.contributorAddress,
          token: params.token,
          amount: params.paymentAmount,
        },
      ],
    // : [],
    milestones:
      // params.advancedPaymentPercentage && params.paymentAmount
      //   ? [
      //       {
      //         id: 0,
      //         title: "Advanced payment",
      //       },
      //       {
      //         id: 1,
      //         title: "Payment upon approval",
      //       },
      //     ]
      //   :
      [
        {
          id: 0,
          title: "Payment upon approval",
        },
      ],
    digest: {
      hash: "",
    },
    ipfsMetadata,
  } as unknown as ProposalNewMetadata

  try {
    const proposal = await db.proposalNew.update({
      where: { id: params.proposalId },
      // TODO: as of 9/1 we currently only support proposals of type "FUNDING"
      // but in the future we need to figure out how to void a funding proposal
      // and change it to a different type and vice versa.
      data: {
        data: JSON.parse(JSON.stringify(proposalMetadata)),
      },
      include: {
        roles: true,
      },
    })
    return proposal
  } catch (err) {
    throw Error(`Error updating proposal, failed with error: ${err.message}`)
  }
}
