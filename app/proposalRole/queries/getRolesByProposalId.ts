import db from "db"
import * as z from "zod"
import { ProposalRole } from "../types"

const GetRolesByProposalId = z.object({
  proposalId: z.string(),
})

export default async function getRolesByProposalId(input: z.infer<typeof GetRolesByProposalId>) {
  try {
    const params = GetRolesByProposalId.parse(input)
    const proposalRoles = await db.proposalRole.findMany({
      where: {
        proposalId: params.proposalId,
      },
      include: {
        account: true,
      },
    })

    if (!proposalRoles) {
      return []
    }
    return proposalRoles as ProposalRole[]
  } catch (err) {
    console.error(`Failed to fetch proposal roles in "getProposalRolesById": ${err}`)
  }
}
