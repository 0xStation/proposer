import db from "db"
import * as z from "zod"
import { Rfp } from "../types"

const GetRfpByProposalId = z.object({
  proposalId: z.string(),
})

export default async function getRfpByProposalId(input: z.infer<typeof GetRfpByProposalId>) {
  try {
    const params = GetRfpByProposalId.parse(input)
    const rfp = await db.rfp.findFirst({
      where: {
        proposals: {
          some: {
            id: {
              equals: params.proposalId,
            },
          },
        },
      },
    })

    if (!rfp) {
      return null
    }

    return rfp as unknown as Rfp
  } catch (err) {
    console.error("Error in getRfpByProposalId", err)
  }
}
