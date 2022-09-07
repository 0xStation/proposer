import * as z from "zod"
import db, { ProposalStatus } from "db"
import { AddressType } from "app/types"
import { ProposalNewMetadata } from "../types"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"

const SaveTransactionHashToPayments = z.object({
  proposalId: z.string(),
  transactionHash: z.string(),
  paymentIds: z.number().array(),
})

export default async function saveTransactionHashToPayments(
  input: z.infer<typeof SaveTransactionHashToPayments>
) {
  const params = SaveTransactionHashToPayments.parse(input)
  // use a transaction to apply many database writes at once
  // creates proposal approval, check approval
  // also updates proposal status if moving from SUBMITTED->IN_REVIEW (first approval) or IN_REVIEW->APPROVED (quorum approval)
  const results = await db.$transaction(async (db) => {
    const proposal = await db.proposalNew.findUnique({
      where: { id: params.proposalId },
    })

    if (!proposal) {
      throw Error("Proposal not found")
    }

    const oldMetadata = proposal.data as unknown as ProposalNewMetadata
    const firstPayment = oldMetadata?.payments?.[0]

    if (!!firstPayment?.transactionHash) {
      throw Error("payment has already been made")
    }

    const newMetadata = {
      ...oldMetadata,
      payments: [{ ...firstPayment, transactionHash: params.transactionHash }],
    } as unknown as ProposalNewMetadata

    await db.proposalNew.update({
      where: { id: params.proposalId },
      data: {
        data: JSON.parse(JSON.stringify(newMetadata)),
      },
    })
  })

  return results
}