import db, { ProposalRoleType } from "db"
import * as z from "zod"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { Proposal, ProposalMetadata } from "../types"
import { Token } from "app/token/types"
import { PaymentTerm } from "app/proposalPayment/types"
import { foxesAddress } from "app/core/utils/constants"
import { getNetworkCoin } from "app/core/utils/networkInfo"

const CreateProposalToFoxesRfp = z.object({
  rfpId: z.string(),
  contentTitle: z.string(),
  contentBody: z.string(),
  authorAddress: z.string(),
})

export default async function createProposalToFoxesRfp(
  input: z.infer<typeof CreateProposalToFoxesRfp>
) {
  const params = CreateProposalToFoxesRfp.parse(input)

  const contributorAddresses = [params.authorAddress]
  const clientAddresses = [foxesAddress]
  const authorAddresses = [params.authorAddress]
  const milestones = [
    {
      title: "Contributor payment",
      index: 0,
    },
  ]
  const payments = [
    {
      milestoneIndex: 0,
      senderAddress: foxesAddress,
      recipientAddress: params.authorAddress,
      token: getNetworkCoin(1),
      amount: 0.01,
    },
  ]

  const proposalMetadata = {
    content: {
      title: params.contentTitle,
      body: params.contentBody,
    },
    totalPayments: payments.map((payment) => {
      return { token: payment.token, amount: payment.amount }
    }),
    paymentTerms: PaymentTerm.ON_AGREEMENT,
  } as unknown as ProposalMetadata

  let proposal = await db.proposal.create({
    data: {
      rfpId: params.rfpId,
      data: JSON.parse(JSON.stringify(proposalMetadata)),
      roles: {
        createMany: {
          data: [
            ...(contributorAddresses || []).map((a) => {
              return { address: toChecksumAddress(a), type: ProposalRoleType.CONTRIBUTOR }
            }),
            ...clientAddresses.map((a) => {
              return { address: toChecksumAddress(a), type: ProposalRoleType.CLIENT }
            }),
            ...authorAddresses.map((a) => {
              return { address: toChecksumAddress(a), type: ProposalRoleType.AUTHOR }
            }),
          ],
        },
      },
      milestones: {
        createMany: {
          data: (milestones || []).map((milestone) => {
            return {
              index: milestone.index,
              data: { title: milestone.title },
            }
          }),
        },
      },
    },
    include: {
      milestones: true,
    },
  })

  const milestoneIndexToId = {}
  proposal.milestones.forEach((milestone) => {
    milestoneIndexToId[milestone.index] = milestone.id
  })

  proposal = await db.proposal.update({
    where: {
      id: proposal.id,
    },
    data: {
      payments: {
        createMany: {
          data: payments.map((payment) => {
            return {
              milestoneId: milestoneIndexToId[payment.milestoneIndex],
              senderAddress: payment.senderAddress,
              recipientAddress: payment.recipientAddress,
              amount: payment.amount,
              data: { token: payment.token as Token },
            }
          }),
        },
      },
    },
    include: {
      roles: {
        include: {
          account: true,
        },
      },
      milestones: true,
      payments: true,
    },
  })

  return proposal as unknown as Proposal
}
