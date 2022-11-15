import db, { ProposalRoleType } from "db"
import * as z from "zod"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { Proposal, ProposalMetadata } from "../types"
import { ZodMilestone, ZodPayment } from "app/types/zod"
import { createAccountsIfNotExist } from "app/utils/createAccountsIfNotExist"
import { Token } from "app/token/types"
import { PaymentTerm } from "app/proposalPayment/types"
import Moralis from "moralis"
import { EvmChain } from "@moralisweb3/evm-utils"

Moralis.start({
  apiKey: "fGXzQqFWWmLIs9QLwunZ6Nu2JmOx6WgIC7QbWeca0bcepI7wQfr30YsPB4Bab8XG",
})

const CreateProposal = z.object({
  rfpId: z.string().optional(),
  contentTitle: z.string(),
  contentBody: z.string(),
  // for initial P0 build, frontend is only supporting one contributor
  contributorAddresses: z.string().array().optional(),
  // for initial P0 build, frontend is only supporting one client
  clientAddresses: z.string().array(),
  // for initial P0 build, frontend is only supporting one author
  authorAddresses: z.string().array(),
  ipfsHash: z.string().optional(),
  ipfsPinSize: z.number().optional(),
  ipfsTimestamp: z.date().optional(),
  milestones: ZodMilestone.array().optional(),
  payments: ZodPayment.array().optional(),
  paymentTerms: z
    .enum([PaymentTerm.ON_AGREEMENT, PaymentTerm.AFTER_COMPLETION, PaymentTerm.ADVANCE_PAYMENT])
    .optional(),
  advancePaymentPercentage: z.number().optional(),
})

export default async function createProposal(input: z.infer<typeof CreateProposal>) {
  const params = CreateProposal.parse(input)

  if (params.authorAddresses.length === 0) {
    throw Error("cannot have zero authors")
  }

  let paymentsProposalMetadata = {}
  if (params.payments) {
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
    paymentsProposalMetadata = {
      totalPayments: Object.values(totalPayments),
      paymentTerms: params.paymentTerms,
      advancePaymentPercentage: params.advancePaymentPercentage,
    }
  }

  // Create accounts for roles that do not yet have accounts
  // Needed for FK constraint on ProposalRole table for addresses to connect to Account objects
  const roleAddresses = [
    ...(params.contributorAddresses || []),
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
    ...paymentsProposalMetadata,
  } as unknown as ProposalMetadata

  let proposal = await db.proposal.create({
    data: {
      ...(params.rfpId && { rfpId: params.rfpId }),
      data: JSON.parse(JSON.stringify(proposalMetadata)),
      roles: {
        createMany: {
          data: [
            ...(params.contributorAddresses || []).map((a) => {
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
          data: (params.milestones || []).map((milestone) => {
            return {
              index: milestone.index,
              data: { title: milestone.title },
            }
          }),
        },
      },
      versions: {
        create: [
          {
            editorAddress: toChecksumAddress(params.authorAddresses[0] as string), // TODO: this only supports one address
            version: 1,
            data: {
              content: {
                title: "Version 1",
                body: undefined,
              },
            },
          },
        ],
      },
    },
    include: {
      milestones: true,
      roles: {
        include: {
          account: true,
        },
      },
    },
  })

  const milestoneIndexToId = {}
  proposal.milestones.forEach((milestone) => {
    milestoneIndexToId[milestone.index] = milestone.id
  })

  if (params.payments) {
    proposal = await db.proposal.update({
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
  }

  // TODO: NEED TO DETECT THE CORRECT CHAIN
  const stream = {
    chains: [EvmChain.GOERLI],
    description: `Station proposal ${proposal.id}`,
    tag: "Gnosis, Station, Proposal",
    // TODO: replace
    webhookUrl: "https://99b8-38-15-57-26.ngrok.io/api/webhook/parse-gnosis-tx",
    includeNativeTxs: true,
    includeInternalTxs: true,
    includeContractLogs: true,
  }

  // we actually only need to create a stream if its a payment proposal type
  // AND if the client is a gnosis safe
  // also probably don't need to create another stream if one already exists for that particular gnosis safe?
  const createdStream = await Moralis.Streams.add(stream)
  const { id } = createdStream.toJSON()
  await Moralis.Streams.addAddress({ address: params.clientAddresses, id })
  return proposal as unknown as Proposal
}
