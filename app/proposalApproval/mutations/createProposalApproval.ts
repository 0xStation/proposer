import db from "db"
import { Ctx } from "blitz"
import * as z from "zod"

const CreateProposalApproval = z.object({
  proposalId: z.string(),
  signerAddress: z.string(),
  signature: z.string(),
})

export default async function createProposalApproval(
  input: z.infer<typeof CreateProposalApproval>,
  ctx: Ctx
) {
  // TODO -- FILL OUT AUTH WHEN OPTIONAL CHECKBOOK PR MERGES
  // WAITING FOR THAT RATHER THAN WRITING THE OLD ONE BC ITLL PROBABLY BE BREAKING CHANGE
  // ID RATHER JUST LEAVE IT
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
