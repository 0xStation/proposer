import db, { AddressType, ProposalRoleType } from "db"
import * as z from "zod"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { ZodPayment, ZodMilestone } from "app/types/zod"
import { ProposalNewMetadata } from "../types"
import { ProposalType } from "db"
import { getAddressType } from "app/utils/getAddressType"
import truncateString from "app/core/utils/truncateString"

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
  payments: ZodPayment.array(),
  milestones: ZodMilestone.array(),
})

export default async function createProposal(input: z.infer<typeof CreateProposal>) {
  const params = CreateProposal.parse(input)

  if (!params.payments.every((payment) => parseFloat(payment.amount || "0") >= 0)) {
    throw new Error("amount must be greater or equal to zero.")
  }

  // Create accounts for roles that do not yet have accounts
  // Needed for FK constraint on ProposalRole table for addresses to connect to Account objects
  const roleAddresses = [
    ...params.contributorAddresses,
    ...params.clientAddresses,
    ...params.authorAddresses,
  ]
  const uniqueRoleAddresses = roleAddresses.filter((v, i, addresses) => addresses.indexOf(v) === i)
  const accounts = await db.account.findMany({
    where: {
      address: {
        in: uniqueRoleAddresses,
      },
    },
  })
  const addressesMissingAccounts = uniqueRoleAddresses.filter((address) =>
    accounts.some((account) => account.address !== address)
  )
  // with list of missing addresses, determine their AddressType
  const addressClassificationRequests = addressesMissingAccounts.map((address) =>
    getAddressType(address)
  )
  const addressClassificationResponses = await Promise.all(addressClassificationRequests)
  // create many Accounts with proper type
  await db.account.createMany({
    skipDuplicates: true, // do not create entries that already exist
    data: addressesMissingAccounts.map((address, i) => {
      const { addressType, chainId } = addressClassificationResponses[i]!
      return {
        address,
        addressType,
        data: {
          name: truncateString(address),
          ...(addressType !== AddressType.WALLET && { chainId }),
        },
      }
    }),
  })

  const { ipfsHash, ipfsPinSize, ipfsTimestamp } = params
  const metadata = {
    content: {
      title: params.contentTitle,
      body: params.contentBody,
    },
    ipfsMetadata: {
      hash: ipfsHash,
      ipfsPinSize,
      timestamp: ipfsTimestamp,
    },
  } as unknown as ProposalNewMetadata

  const proposal = await db.proposalNew.create({
    data: {
      type: ProposalType.FUNDING,
      data: JSON.parse(JSON.stringify(metadata)),
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
      roles: true,
      payments: true,
      milestones: true,
    },
  })

  return proposal
}
