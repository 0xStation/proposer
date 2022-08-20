import db from "../index"
import { ProposalStatus as PrismaProposalStatus } from "@prisma/client"

// // run with: blitz db seed -f db/data-migrations/1-proposal-status.ts
// const seed = async () => {
//   // Update proposal approval status based on signature count and quorum

//   const proposalsWithApprovals = await db.proposal.findMany({
//     include: {
//       approvals: true,
//       rfp: { include: { checkbook: true } },
//     },
//   })
//   const proposalUpdates2 = proposalsWithApprovals.map((proposal) => {
//     const quorum = proposal.rfp.checkbook.quorum
//     const numApprovals = proposal.approvals.length
//     let newStatus
//     if (numApprovals >= quorum) {
//       newStatus = PrismaProposalStatus.APPROVED
//     } else if (numApprovals > 0) {
//       newStatus = PrismaProposalStatus.IN_REVIEW
//     } else {
//       newStatus = proposal.status
//     }

//     return db.proposal.update({
//       where: { id: proposal.id },
//       data: {
//         status: newStatus,
//       },
//     })
//   })

//   const res3 = await db.$transaction(proposalUpdates2)
//   console.log("proposal status update transaction complete", res3.length)
// }

// export default seed
