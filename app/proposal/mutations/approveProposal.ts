import db from "db"
import * as z from "zod"

const ApproveProposal = z.object({
  checkId: z.string(),
  proposalId: z.string(),
  signerAddress: z.string(),
  signature: z.string(),
})

export default async function approveProposal(input: z.infer<typeof ApproveProposal>) {
  const results = await db.$transaction([
    db.proposalApproval.create({
      data: {
        proposalId: input.proposalId,
        signerAddress: input.signerAddress,
        data: {
          signature: input.signature,
        },
      },
    }),
    db.checkApproval.create({
      data: {
        checkId: input.checkId,
        signerAddress: input.signerAddress,
        data: {
          signature: input.signature,
        },
      },
    }),
  ])

  return results
}
