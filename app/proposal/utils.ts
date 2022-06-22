import { ProposalStatus } from "app/proposal/types"
import { ProposalStatus as PrismaProposalStatus } from "@prisma/client"

export const computeProposalDbStatusFilter = (status: string) => {
  if (status === ProposalStatus.DRAFT) {
    return {
      status: PrismaProposalStatus.DRAFT,
    }
  } else if (status === ProposalStatus.SUBMITTED) {
    return {
      status: PrismaProposalStatus.PUBLISHED,
      // funding signatures > 0
    }
  } else if (status === ProposalStatus.IN_REVIEW) {
    return {
      status: PrismaProposalStatus.PUBLISHED,
      //funding signatures > 0, < quorum
    }
  } else if (status === ProposalStatus.APPROVED) {
    return {
      status: PrismaProposalStatus.PUBLISHED,
      // funding signatures = quorum
    }
  } else {
    return {}
  }
}

// export const computeProposalProductStatus = (
//   status: string,
//   startDate: Date,
//   endDate: Date | null
// ) => {
//   if (status === PrismaProposalStatus.DRAFT) {
//     return ProposalStatus.DRAFT
//   } else if (status === PrismaProposalStatus.DELETED) {
//     return ProposalStatus.DELETED
//   } else if (new Date() < startDate) {
//     return ProposalStatus.STARTING_SOON
//   } else if (!!endDate && new Date() > endDate) {
//     return ProposalStatus.CLOSED
//   } else {
//     return ProposalStatus.OPEN_FOR_SUBMISSIONS
//     // last option is between start and end
//   }
// }
