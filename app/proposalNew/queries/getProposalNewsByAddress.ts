import db from "db"
import * as z from "zod"
import { ProposalNew } from "app/proposalNew/types"
import { ProposalStatus } from "@prisma/client"

const GetProposalNewsByAddress = z.object({
  address: z.string(),
  statuses: z.any().array().optional(),
  roles: z.string().array().optional(),
})

export default async function getProposalNewsByAddress(
  input: z.infer<typeof GetProposalNewsByAddress>
) {
  const data = GetProposalNewsByAddress.parse(input)

  const proposalNews = (await db.proposalNew.findMany({
    where: {
      roles: {
        some: {
          address: data.address,
        },
      },
    },
  })) as unknown as ProposalNew[]

  return proposalNews
}
