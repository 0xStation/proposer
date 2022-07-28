import db from "db"
import * as z from "zod"

const CreateProposalApproval = z.object({
  proposalId: z.string(),
  signerAddress: z.string(),
  signature: z.string(),
})

export default async function createProposalApproval(
  input: z.infer<typeof CreateProposalApproval>
) {
  const proposalApproval = await db.proposalApproval.create({
    data: {
      proposalId: input.proposalId,
      signerAddress: input.signerAddress,
      data: {
        signature: input.signature,
      },
    },
  })

  return proposalApproval
}
