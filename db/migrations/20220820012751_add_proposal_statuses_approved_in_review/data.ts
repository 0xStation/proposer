import db from "../../index"
import { ProposalStatus as PrismaProposalStatus } from "@prisma/client"

// Note: Data migration scripts need to be commented out after they are used to prevent 
// typescript errors due to schema conflicts between current and when a script was run

// run with: blitz db seed -f db/migrations/20220820012751_add_proposal_statuses_approved_in_review/data.ts

// const seed = async () => {
//   // Update proposal approval status based on signature count and quorum

//   const proposalsWithApprovals = await db.proposal.findMany({
//     include: {
//       approvals: true,
//       rfp: { include: { checkbook: true } },
//     },
//   })
  
//   const proposalUpdates = proposalsWithApprovals.map((proposal) => {
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

//   const res = await db.$transaction(proposalUpdates)
//   console.log("proposal status update transaction complete", res.length)
// }

// export default seed