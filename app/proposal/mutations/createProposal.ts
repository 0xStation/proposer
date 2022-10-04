import db, { ProposalRoleType } from "db"
import * as z from "zod"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { Proposal, ProposalMetadata } from "../types"
import { ZodMilestone, ZodPayment } from "app/types/zod"
import { createAccountsIfNotExist } from "app/utils/createAccountsIfNotExist"
import { Token } from "app/token/types"
import { PaymentTerm } from "app/proposalPayment/types"
import { sendNewProposalEmail } from "app/utils/email"
import { getEmails } from "app/utils/privy"

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
})

export default async function createProposal(input: z.infer<typeof CreateProposal>) {
  const params = CreateProposal.parse(input)

  if (params.authorAddresses.length === 0) {
    throw Error("cannot have zero authors")
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
  } as unknown as ProposalMetadata

  const proposal = await db.proposal.create({
    data: {
      data: JSON.parse(JSON.stringify(proposalMetadata)),
      roles: {
        createMany: {
          data: [
            ...params.contributorAddresses.map((a) => {
              return { address: toChecksumAddress(a), type: ProposalRoleType.CONTRIBUTOR }
            }),
            ...params.clientAddresses.map((a) => {
              return { address: toChecksumAddress(a), type: ProposalRoleType.CLIENT }
            }),
            ...params.authorAddresses.map((a) => {
              return { address: toChecksumAddress(a), type: ProposalRoleType.AUTHOR }
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
    },
    include: {
      milestones: true,
    },
  })

  const milestoneIndexToId = {}
  proposal.milestones.forEach((milestone) => {
    milestoneIndexToId[milestone.index] = milestone.id
  })

  const proposalWithPayments = await db.proposal.update({
    where: {
      id: proposal.id,
    },
    data: {
      payments: {
        createMany: {
          data: params.payments.map((payment) => {
            return {
              milestoneId: milestoneIndexToId[payment.milestoneIndex],
              senderAddress: payment.senderAddress,
              recipientAddress: payment.recipientAddress,
              amount: payment.amount,
              tokenId: payment.tokenId,
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

  try {
    // send notification emails
    const author = proposalWithPayments.roles.find(
      (role) => role.type === ProposalRoleType.AUTHOR
    )?.account

    const emails = await getEmails(
      proposalWithPayments.roles
        .filter((role) => role.type !== ProposalRoleType.AUTHOR && role.address !== author?.address)
        .map((role) => role.address)
    )

    await sendNewProposalEmail({
      recipients: emails,
      account: author,
      proposal: proposalWithPayments,
    })
  } catch (e) {
    // silently fail
    console.warn("Failed to send notification emails in `createProposal`", e)
  }

  return proposalWithPayments as unknown as Proposal
}
