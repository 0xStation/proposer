import db from "db"
import * as z from "zod"

const GetProposalNewApprovalsByProposalId = z.object({
  proposalId: z.string(),
})

export default async function getProposalNewApprovalsByProposalId(
  input: z.infer<typeof GetProposalNewApprovalsByProposalId>
) {
  const params = GetProposalNewApprovalsByProposalId.parse(input)

  const approvals = await db.proposalNewApproval.findMany({
    where: {
      proposalId: params.proposalId,
    },
    include: {
      // include signatures within approvals to have an easier time rendering the multisig ring progress
      signatures: true,
    },
  })

  return approvals
}
