import { PROPOSAL_NEW_STATUS_FILTER_OPTIONS } from "app/core/utils/constants"
import db, { ProposalRoleType, ProposalStatus, RfpStatus } from "db"
import * as z from "zod"

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

  const count = db.proposal.count({
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
  })

  return count
}
