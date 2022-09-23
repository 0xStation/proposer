import db, { ProposalRoleType } from "db"
import * as z from "zod"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { ZodPayment, ZodMilestone } from "app/types/zod"
import { ProposalNewMetadata } from "../types"
import { ProposalType } from "db"
import { createAccountsIfNotExist } from "app/utils/createAccountsIfNotExist"
import { Token } from "app/token/types"
import { PaymentTerm } from "app/proposalPayment/types"

const CreateProposal = z.object({
  contentTitle: z.string(),
  contentBody: z.string(),
  // for initial P0 build, frontend is only supporting one contributor
  contributorAddresses: z.string().array(),
  // for initial P0 build, frontend is only supporting one client
  clientAddresses: z.string().array(),
  // for initial P0 build, frontend is only supporting one author
  authorAddresses: z.string().array(),
  ipfsHash: z.string().optional(),
  ipfsPinSize: z.number().optional(),
  ipfsTimestamp: z.date().optional(),
  milestones: ZodMilestone.array(),
  payments: ZodPayment.array(),
  paymentTerms: z.enum([PaymentTerm.ON_AGREEMENT, PaymentTerm.AFTER_COMPLETION]).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
})

export default async function createProposal(input: z.infer<typeof CreateProposal>) {
  const params = CreateProposal.parse(input)

  if (params.endDate && params.startDate) {
    if (params.startDate > params.endDate) {
      throw new Error("end date cannot come before start date")
    }
  }

  // validate non-negative amounts and construct totalPayments object
  let totalPayments: Record<string, { token: Token; amount: number }> = {}
  params.payments.forEach((payment) => {
    if (payment.amount! < 0) {
      throw new Error("amount must be greater or equal to zero.")
    }
    const key = `${payment.token.chainId}-${payment.token.address}`
    if (!totalPayments[key]) {
      totalPayments[key] = { token: payment.token, amount: payment.amount! }
    } else {
      totalPayments[key]!.amount += payment.amount!
    }
  })

  // Create accounts for roles that do not yet have accounts
  // Needed for FK constraint on ProposalRole table for addresses to connect to Account objects
  const roleAddresses = [
    ...params.contributorAddresses,
    ...params.clientAddresses,
    ...params.authorAddresses,
  ]
  await createAccountsIfNotExist(roleAddresses)

  const { ipfsHash, ipfsPinSize, ipfsTimestamp } = params
  const proposalMetadata = {
    content: {
      title: params.contentTitle,
      body: params.contentBody,
    },
    ipfsMetadata: {
      hash: ipfsHash,
      ipfsPinSize,
      timestamp: ipfsTimestamp,
    },
    totalPayments: Object.values(totalPayments),
    paymentTerms: params.paymentTerms,
  } as unknown as ProposalNewMetadata

  const proposal = await db.proposalNew.create({
    data: {
      type: ProposalType.FUNDING,
      data: JSON.parse(JSON.stringify(proposalMetadata)),
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate }),
      roles: {
        createMany: {
          data: [
            ...params.contributorAddresses.map((a) => {
              return { address: toChecksumAddress(a), role: ProposalRoleType.CONTRIBUTOR }
            }),
            ...params.clientAddresses.map((a) => {
              return { address: toChecksumAddress(a), role: ProposalRoleType.CLIENT }
            }),
            ...params.authorAddresses.map((a) => {
              return { address: toChecksumAddress(a), role: ProposalRoleType.AUTHOR }
            }),
          ],
        },
      },
      milestones: {
        createMany: {
          data: params.milestones.map((milestone) => {
            return {
              index: milestone.index,
              data: { title: milestone.title },
            }
          }),
        },
      },
      payments: {
        createMany: {
          data: params.payments.map((payment) => {
            return {
              senderAddress: payment.senderAddress,
              recipientAddress: payment.recipientAddress,
              amount: payment.amount,
              tokenId: payment.tokenId,
              milestoneIndex: payment.milestoneIndex,
              data: { token: payment.token },
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

  return proposal
}
