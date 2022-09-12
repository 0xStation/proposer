import db from "db"
import * as z from "zod"
import { Proposal } from "app/proposal/types"
import { ProposalStatus } from "@prisma/client"

const GetProposalsByAddress = z.object({
  address: z.string(),
  statuses: z.any().array().optional(),
  roles: z.string().array().optional(),
})

export default async function getProposalsByAddress(input: z.infer<typeof GetProposalsByAddress>) {
  const data = GetProposalsByAddress.parse(input)
  console.log(data.statuses)

  const proposals = (await db.proposal.findMany({
    where: {
      collaborators: {
        some: {
          address: data.address,
        },
      },
      status: {
        in: data.statuses,
      },
    },
  })) as unknown as Proposal[]

  return proposals
}
