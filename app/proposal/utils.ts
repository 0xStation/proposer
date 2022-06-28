import { ProposalStatus as PrismaProposalStatus } from "@prisma/client"
import { ProposalStatus as ProductProposalStatus } from "./types"

/**
 * Submitted: db status = PUBLISHED && approval count = 0
 * In review: db status = PUBLISHED && approval count > 0, < quorum
 * Approved: db status = PUBLISHED && approval count = quorum
 */
export const computeApprovalCountFilter = (statuses: string[], quorum: number) => {
  if (statuses.includes(ProductProposalStatus.IN_REVIEW) && statuses.length === 1) {
    return { gt: 0, lt: quorum }
  } else if (statuses.includes(ProductProposalStatus.APPROVED) && statuses.length === 1) {
    return { equals: quorum }
  } else if (
    statuses.includes(ProductProposalStatus.SUBMITTED) &&
    statuses.includes(ProductProposalStatus.IN_REVIEW) &&
    statuses.length === 2
  ) {
    return { lt: quorum }
  } else if (
    statuses.includes(ProductProposalStatus.SUBMITTED) &&
    statuses.includes(ProductProposalStatus.APPROVED) &&
    statuses.length === 2
  ) {
    return { in: [0, quorum] }
  } else if (
    statuses.includes(ProductProposalStatus.IN_REVIEW) &&
    statuses.includes(ProductProposalStatus.APPROVED) &&
    statuses.length === 2
  ) {
    return { gt: 0 }
  } else if (
    statuses.includes(ProductProposalStatus.SUBMITTED) &&
    statuses.includes(ProductProposalStatus.IN_REVIEW) &&
    statuses.includes(ProductProposalStatus.APPROVED) &&
    statuses.length === 3
  ) {
    // keep filters as empty object
    return null
  } else {
    // no status filters applied
    return null
  }
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
