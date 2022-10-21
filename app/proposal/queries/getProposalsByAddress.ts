import db, { ProposalStatus, ProposalRoleType } from "db"
import * as z from "zod"
import { Proposal } from "app/proposal/types"
import { PAGINATION_TAKE } from "app/core/utils/constants"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"

const GetProposalsByAddress = z.object({
  address: z.string(),
  statuses: z.any().array().optional(),
  roles: z.any().array().optional(),
  page: z.number().optional().default(0),
  paginationTake: z.number().optional().default(PAGINATION_TAKE),
})

export default async function getProposalsByAddress(input: z.infer<typeof GetProposalsByAddress>) {
  const params = GetProposalsByAddress.parse(input)

  const whereParams = {
    where: {
      suppress: false,
      roles: {
        some: {
          address: params.address,
          ...(params.roles &&
            params.roles.length > 0 && {
              type: {
                in: params.roles,
              },
            }),
        },
      },
      ...(params.statuses &&
        params.statuses.length > 0 && {
          status: {
            in: params.statuses,
          },
        }),
    },
  }

  const proposals = (await db.proposal.findMany({
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
  })) as unknown as Proposal[]

  return proposals.filter((proposal) => {
    if (proposal?.status === ProposalStatus.DRAFT) {
      const authorRole = proposal?.roles?.find((role) => role.type === ProposalRoleType.AUTHOR)
      return addressesAreEqual(params.address, authorRole?.address as string)
    }
    return true
  })
}
