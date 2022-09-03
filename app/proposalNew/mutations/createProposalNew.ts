import db, { AddressType, ProposalRoleType } from "db"
import * as z from "zod"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { ZodToken } from "app/types/zod"
import { ProposalNewMetadata } from "../types"
import { ProposalType } from "db"
import { getAddressDetails } from "app/utils/getAddressDetails"
import truncateString from "app/core/utils/truncateString"

const CreateProposal = z.object({
  contentTitle: z.string(),
  contentBody: z.string(),
  contributorAddresses: z.string().array(),
  clientAddresses: z.string().array(),
  authorAddresses: z.string().array(),
  payments: z
    .object({
      milestoneId: z.number(),
      recipientAddress: z.string(),
      token: ZodToken,
      amount: z.string(),
    })
    .array(),
})

export default async function createProposal(input: z.infer<typeof CreateProposal>) {
  const params = CreateProposal.parse(input)

  if (!params.payments.every((payment) => parseFloat(payment.amount) >= 0)) {
    throw new Error("amount must be greater or equal to zero.")
  }

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

  const addressClassificationRequests = addressesMissingAccounts.map((address) =>
    getAddressDetails(address)
  )
  const addressClassificationResponses = await Promise.all(addressClassificationRequests)

  await db.account.createMany({
    skipDuplicates: true, // do not create entries that already exist
    data: addressesMissingAccounts.map((address, i) => {
      const { type, chainId } = addressClassificationResponses[i]!
      return {
        address,
        type,
        data: {
          name: truncateString(address),
          ...(type !== AddressType.WALLET && { chainId }),
        },
      }
    }),
  })

  const metadata = {
    content: {
      title: params.contentTitle,
      body: params.contentBody,
    },
    // if no payment amount we can infer that there is no payment requested
    // it might be better to pass this through more explicitly with a flag for "no funding"
    // but we are doing this the quick way with minimal infra
    // if we get validation this is good idea we can improve
    payments: params.payments,
    digest: {
      hash: "",
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
