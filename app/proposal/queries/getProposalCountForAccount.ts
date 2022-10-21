import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { PROPOSAL_NEW_STATUS_FILTER_OPTIONS } from "app/core/utils/constants"
import db, { ProposalRoleType, ProposalStatus, RfpStatus } from "db"
import * as z from "zod"
import { Proposal } from "../types"
import getProposalsByAddress from "./getProposalsByAddress"

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
