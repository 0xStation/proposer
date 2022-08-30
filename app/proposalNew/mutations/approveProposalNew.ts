import * as z from "zod"
import db from "db"

const ApproveProposalNew = z.object({
  proposalId: z.string(),
  signerAddress: z.string(),
  signature: z.string(),
})

export default async function approveProposalNew(input: z.infer<typeof ApproveProposalNew>) {
  const params = ApproveProposalNew.parse(input)

  const signature = await db.proposalSignature.create({
    data: {
      proposalId: params.proposalId,
      address: params.signerAddress,
      data: {
        signature: params.signature,
      },
    },
  })

  return signature
}
