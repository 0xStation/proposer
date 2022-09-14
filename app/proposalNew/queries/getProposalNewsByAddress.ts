import db from "db"
import * as z from "zod"
import { ProposalNew } from "app/proposalNew/types"
import { PAGINATION_TAKE } from "app/core/utils/constants"

const GetProposalNewsByAddress = z.object({
  address: z.string(),
  statuses: z.any().array().optional(),
  roles: z.any().array().optional(),
  page: z.number().optional().default(0),
  paginationTake: z.number().optional().default(PAGINATION_TAKE),
})

export default async function getProposalNewsByAddress(
  input: z.infer<typeof GetProposalNewsByAddress>
) {
  const data = GetProposalNewsByAddress.parse(input)

  const response = (await db.$transaction([
    db.proposalNew.count(),
    db.proposalNew.findMany({
      where: {
        roles: {
          some: {
            address: data.address,
            ...(data.roles &&
              data.roles.length > 0 && {
                role: {
                  in: data.roles,
                },
              }),
          },
        },
        ...(data.statuses &&
          data.statuses.length > 0 && {
            status: {
              in: data.statuses,
            },
          }),
      },
      take: input.paginationTake,
      skip: input.page * input.paginationTake,
      orderBy: {
        timestamp: "desc",
      },
    }),
  ])) as unknown as [number, ProposalNew[]]

  let count = response[0]
  let proposals = response[1]

  return {
    count,
    proposals,
  }
}
