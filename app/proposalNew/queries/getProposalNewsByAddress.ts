import db, { ProposalNewStatus, ProposalRoleType } from "db"
import * as z from "zod"
import { ProposalNew } from "app/proposalNew/types"
import { PAGINATION_TAKE } from "app/core/utils/constants"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"

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

  const whereParams = {
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
  }

  const response = (await db.$transaction([
    db.proposalNew.count(whereParams),
    db.proposalNew.findMany({
      ...whereParams,
      take: input.paginationTake,
      skip: input.page * input.paginationTake,
      orderBy: {
        timestamp: "desc",
      },
      include: {
        roles: {
          include: {
            account: true,
          },
        },
      },
    }),
  ])) as unknown as [number, ProposalNew[]]

  let count = response[0]
  let proposals = response[1]

  return {
    count,
    proposals: proposals.filter((proposal) => {
      if (proposal?.status === ProposalNewStatus.DRAFT) {
        const authorRole = proposal?.roles?.find((role) => role.role === ProposalRoleType.AUTHOR)
        return addressesAreEqual(data.address, authorRole?.address as string)
      }
      return true
    }),
  }
}
