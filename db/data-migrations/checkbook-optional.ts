import { ProposalMetadata } from "app/proposal/types"
import { RfpMetadata } from "app/rfp/types"
import { FundingSenderType } from "app/types"
import db from "../index"
import { ProposalStatus as PrismaProposalStatus } from "@prisma/client"

// const seed = async () => {
//   // 1. Copy linked checkbook address into rfp's metadata

//   const rfps = await db.rfp.findMany()
//   const rfpUpdates = rfps.map((rfp) => {
//     const oldMetadata = rfp.data as unknown as RfpMetadata
//     const newMetadata = {
//       ...oldMetadata,
//       funding: {
//         ...oldMetadata.funding,
//         senderType: FundingSenderType.CHECKBOOK,
//         senderAddress: rfp.fundingAddress,
//       },
//     }

//     return db.rfp.update({
//       where: { id: rfp.id },
//       data: {
//         data: JSON.parse(JSON.stringify(newMetadata)),
//       },
//     })
//   })

//   const res1 = await db.$transaction(rfpUpdates)
//   console.log("rfp metadata update transaction complete", res1)

//   // 2. Copy linked checkbook addresses into rfp's proposals' metadata

//   const proposals = await db.proposal.findMany({
//     include: {
//       rfp: { include: { checkbook: true } },
//     },
//   })
//   const proposalUpdates1 = proposals.map((proposal) => {
//     const oldMetadata = proposal.data as unknown as ProposalMetadata
//     const newMetadata = {
//       ...oldMetadata,
//       funding: {
//         ...oldMetadata.funding,
//         senderType: FundingSenderType.CHECKBOOK,
//         senderAdderss: proposal.rfp.checkbook.address,
//         chainId: proposal.rfp.checkbook.chainId,
//       },
//     }

//     return db.proposal.update({
//       where: { id: proposal.id },
//       data: {
//         data: JSON.parse(JSON.stringify(newMetadata)),
//       },
//     })
//   })

//   const res2 = await db.$transaction(proposalUpdates1)
//   console.log("proposal metadata update transaction complete", res2)

//   // 3. Update proposal approval status based on signature count and quorum

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
//   console.log("proposal status update transaction complete", res3)
// }

// export default seed
