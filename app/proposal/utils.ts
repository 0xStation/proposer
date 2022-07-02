import db from "db"
import { ProposalStatus as PrismaProposalStatus } from "@prisma/client"
import { ProposalStatus as ProductProposalStatus } from "./types"
/**
 * "SUBMITTED": db status = PUBLISHED && approval count = 0
 * "IN REVIEW": db status = PUBLISHED && approval count > 0, < quorum
 * "APPROVED": db status = PUBLISHED && approval count = quorum
 */
export const computeApprovalCountFilter = (statuses: string[], quorum: number) => {
  if (
    statuses.includes(ProductProposalStatus.IN_REVIEW) &&
    statuses.includes(ProductProposalStatus.APPROVED)
  ) {
    return null
  } else if (statuses.includes(ProductProposalStatus.IN_REVIEW)) {
    return { lt: quorum }
  } else if (statuses.includes(ProductProposalStatus.APPROVED)) {
    return { equals: quorum }
  } else {
    return null
  }
}

/**
 * Statuses Context: Proposal statuses are stored as two statuses in the db (DRAFT & PUBLISHED),
 * but there are other statuses that we want to display to the user such as `OPEN FOR SUBMISSIONS`.
 * These statuses that are shown to ther user are based on other variables, such as proposal approvals and quorum (see relationship below).
 * There's the undecided decision whether quorum can be changed while an RFP is ongoing, but if it can then
 * we would need some sort of task queue to update the proposal statuses if they were to exist in the db (IN_REVIEW -> APPROVED).
 * For now, we are deciding to create accurate proposal statuses on read of the proposals query to show the most accurate
 * experience to the user.
 *
 * "SUBMITTED": db status = PUBLISHED && approval count = 0
 * "IN REVIEW": db status = PUBLISHED && approval count > 0, < quorum
 * "APPROVED": db status = PUBLISHED && approval count = quorum
 */
export const computeProposalDbFilterFromProposalApprovals = async ({ statuses, rfpId, quorum }) => {
  // To filter for proposals where the status should be SUBMITTED (aka db status = PUBLISHED && approval count = 0)
  // we need to check whether the proposalApprovals relation count is 0. Since `proposalApproval`s don't exist when
  // the relation count is 0, we need a separate query than the other statuses to check if they exist at all.
  const submittedFilter =
    statuses && statuses?.length && statuses.includes(ProductProposalStatus.SUBMITTED)
      ? { approvals: { none: {} } }
      : {}

  // Generate `proposalApproval` prisma filter to grab applicable proposal ids for in review and approved statuses
  let approvalCountFilter = computeApprovalCountFilter(statuses, quorum)

  let proposalStatusGroupFilter = {}
  if (approvalCountFilter) {
    // grab the proposal ids where the proposalApprovals have the relevant status(es) count
    const proposalStatusGroup = await db.proposalApproval.groupBy({
      where: {
        proposal: {
          rfpId: rfpId,
          status: PrismaProposalStatus.PUBLISHED,
        },
      },
      by: ["proposalId"],
      having: {
        proposalId: {
          _count: approvalCountFilter,
        },
      },
      _count: {
        _all: true,
        proposalId: true,
      },
    })

    const proposalIds = proposalStatusGroup.map((g) => g.proposalId)
    proposalStatusGroupFilter = { id: { in: proposalIds } }
  }

  // generate final filter that includes submitted + in review and approved filter
  let proposalsWhere = {}
  if (Object.keys(submittedFilter).length || Object.keys(proposalStatusGroupFilter).length) {
    proposalsWhere = {
      OR: [
        {
          ...submittedFilter,
        },
        { ...proposalStatusGroupFilter },
      ],
    }
  }

  return proposalsWhere
}

export const computeProposalStatus = (approvalCount: number, quorum: number) => {
  if (approvalCount === 0) {
    return ProductProposalStatus.SUBMITTED
  } else if (approvalCount < quorum) {
    return ProductProposalStatus.IN_REVIEW
  } else {
    return ProductProposalStatus.APPROVED
  }
}
