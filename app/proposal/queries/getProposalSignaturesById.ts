import db from "db"
import * as z from "zod"

const GetProposalSignaturesById = z.object({
  proposalId: z.string(),
  proposalVersion: z.number(),
})

export default async function getProposalSignaturesById(
  params: z.infer<typeof GetProposalSignaturesById>
) {
  const signatures = await db.proposalSignature.findMany({
    where: {
      proposalId: params.proposalId,
      proposalVersion: params.proposalVersion,
      proposal: {
        suppress: false,
      },
    },
  })

  if (!signatures) {
    return []
  }

  return signatures
}
