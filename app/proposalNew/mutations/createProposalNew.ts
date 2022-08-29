import db, { ProposalRoleType } from "db"
import * as z from "zod"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { ZodToken } from "app/types/zod"
import { ProposalNewMetadata, ProposalType } from "../types"

const CreateProposal = z.object({
  contentTitle: z.string(),
  contentBody: z.string(),
  contributorAddress: z.string(),
  clientAddress: z.string(),
  authorAddresses: z.string().array(),
  token: ZodToken,
  paymentAmount: z.string(),
})

export default async function createProposal(input: z.infer<typeof CreateProposal>) {
  const params = CreateProposal.parse(input)

  if (parseFloat(input.paymentAmount) < 0) {
    throw new Error("amount must be greater or equal to zero.")
  }

  const metadata = {
    type: ProposalType.FUNDING,
    timestamp: new Date(),
    content: {
      title: params.contentTitle,
      body: params.contentBody,
    },
    payments: [
      {
        milestoneId: 0,
        recipientAddress: params.contributorAddress,
        token: params.token,
        amount: params.paymentAmount,
      },
    ],
    digest: {
      hash: "",
      domain: { name: "ProposalNew", version: "1" },
      types: [],
    },
    commitments: [],
    tokens: [],
  } as unknown as ProposalNewMetadata

  const proposal = await db.proposalNew.create({
    data: {
      data: JSON.parse(JSON.stringify(metadata)),
      roles: {
        createMany: {
          data: [
            ...[params.contributorAddress].map((a) => {
              return { address: toChecksumAddress(a), role: ProposalRoleType.CONTRIBUTOR }
            }),
            ...[params.clientAddress].map((a) => {
              return { address: toChecksumAddress(a), role: ProposalRoleType.CLIENT }
            }),
            ...params.authorAddresses.map((a) => {
              return { address: toChecksumAddress(a), role: ProposalRoleType.AUTHOR }
            }),
          ],
        },
      },
    },
  })

  return proposal
}
