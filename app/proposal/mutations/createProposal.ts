import db from "db"
import * as z from "zod"
import { AddressType } from "@prisma/client"
import { toChecksumAddress } from "app/core/utils/checksumAddress"

const CreateProposal = z.object({
  terminalId: z.number(),
  rfpId: z.string(),
  chainId: z.number(),
  token: z.string(),
  amount: z.string(),
  symbol: z.string().optional(),
  recipientAddress: z.string(),
  contentTitle: z.string(),
  contentBody: z.string(),
  collaborators: z.array(z.string()),
  signature: z.string(),
  signatureMessage: z.any(),
  senderAddress: z.string().optional(),
  senderType: z.enum([AddressType.CHECKBOOK, AddressType.SAFE, AddressType.WALLET]).optional(),
})

export default async function createProposal(input: z.infer<typeof CreateProposal>) {
  if (parseFloat(input.amount) < 0) {
    throw new Error("amount must be greater or equal to zero.")
  }

  const proposal = await db.proposal.create({
    data: {
      rfpId: input.rfpId,
      data: {
        signature: input.signature,
        signatureMessage: input.signatureMessage,
        content: {
          title: input.contentTitle,
          body: input.contentBody,
        },
        funding: {
          senderAddress: input.senderAddress ? toChecksumAddress(input.senderAddress) : undefined,
          senderType: input.senderType,
          chainId: input.chainId,
          recipientAddress: input.recipientAddress,
          token: input.token,
          amount: input.amount,
          symbol: input.symbol,
        },
      },
      collaborators: {
        createMany: {
          data: input.collaborators.map((collaborator) => {
            return {
              address: collaborator,
              terminalId: input.terminalId,
            }
          }),
        },
      },
    },
  })
  return proposal
}
