import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import db, { ProposalRoleType, ProposalStatus } from "db"
import * as z from "zod"
import { Proposal } from "../types"

const GetProposalCountForAccount = z.object({
  address: z.string(),
  statuses: z
    .enum([
      ProposalStatus.APPROVED,
      ProposalStatus.AWAITING_APPROVAL,
      ProposalStatus.DRAFT,
      ProposalStatus.COMPLETE,
    ])
    .array()
    .optional(),
  roles: z
    .enum([ProposalRoleType.AUTHOR, ProposalRoleType.CONTRIBUTOR, ProposalRoleType.CLIENT])
    .array()
    .optional(),
})

export default async function getProposalCountForAccount(
  input: z.infer<typeof GetProposalCountForAccount>
) {
  const params = GetProposalCountForAccount.parse(input)

  const whereParams = {
    where: {
      suppress: false,
      deleted: false,
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
      ...(params.statuses && params.statuses.length > 0
        ? {
            status: {
              in: params.statuses,
              not: ProposalStatus.DRAFT,
            },
          }
        : {
            status: {
              not: ProposalStatus.DRAFT,
            },
          }),
    },
  }

  const proposals = (await db.proposal.findMany({
    ...whereParams,
    include: {
      roles: true,
    },
  })) as unknown as Proposal[]

  return proposals.filter((proposal) => {
    if (proposal?.status === ProposalStatus.DRAFT) {
      const authorRole = proposal?.roles?.find((role) => role.type === ProposalRoleType.AUTHOR)
      return addressesAreEqual(params.address, authorRole?.address as string)
    }
    return true
  }).length
}
