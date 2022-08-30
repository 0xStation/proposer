import * as z from "zod"
import db, { ProposalStatus } from "db"
import { AddressType } from "app/types"
import { ProposalNewMetadata } from "../types"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"

const ApproveProposalNew = z.object({
  proposalId: z.string(),
  signerAddress: z.string(),
  signature: z.string(),
})

export default async function approveProposalNew(input: z.infer<typeof ApproveProposalNew>) {
  const params = ApproveProposalNew.parse(input)
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

    if (
      oldMetadata.commitments.some((commitment) =>
        addressesAreEqual(commitment.address, params.signerAddress)
      )
    ) {
      throw Error("address has already signed")
    }

    const newMetadata = {
      ...oldMetadata,
      commitments: [
        ...oldMetadata.commitments,
        { address: params.signerAddress, signature: params.signature },
      ],
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
