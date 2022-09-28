import db from "db"
import * as z from "zod"

const GetProposalSignaturesById = z.object({
  proposalId: z.string(),
})

export default async function getProposalSignaturesById(
  params: z.infer<typeof GetProposalSignaturesById>
) {
  const signatures = await db.proposalSignature.findMany({
    where: {
      proposalId: params.proposalId,
    },
  })

  if (!signatures) {
    return []
  }

  return signatures
}
