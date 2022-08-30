import db from "db"
import * as z from "zod"

const GetProposalNewSignaturesById = z.object({
  proposalId: z.string(),
})

export default async function getProposalNewSignaturesById(
  params: z.infer<typeof GetProposalNewSignaturesById>
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
