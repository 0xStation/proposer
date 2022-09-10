import db, { AddressType, ProposalRoleType } from "db"
import * as z from "zod"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { OptionalZodToken } from "app/types/zod"
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
  token: OptionalZodToken,
  paymentAmount: z.string().optional(),
  ipfsHash: z.string().optional(),
  ipfsPinSize: z.number().optional(), // ipfs
  ipfsTimestamp: z.date().optional(),
  // paymentTermType: z.string().optional(),
  // advancedPaymentPercentage: z.number().optional(),
})

export default async function createProposal(input: z.infer<typeof CreateProposal>) {
  const params = CreateProposal.parse(input)

  if (params.paymentAmount && parseFloat(params.paymentAmount) < 0) {
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

  const proposalHasPayment = params.paymentAmount && parseFloat(params.paymentAmount) > 0

  const { ipfsHash, ipfsPinSize, ipfsTimestamp } = params
  const metadata = {
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
      proposalHasPayment
        ? [
            {
              milestoneId: 0,
              recipientAddress: params.contributorAddresses[0],
              token: params.token,
              amount: params.paymentAmount,
            },
          ]
        : [],
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
      proposalHasPayment
        ? [
            {
              id: 0,
              title: "Payment upon approval",
            },
          ]
        : [],
    digest: {
      hash: "",
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
    },
    include: {
      roles: true,
    },
  })

  return proposal
}
