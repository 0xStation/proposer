// import db from "../../index"
// import { ProposalMetadata } from "app/proposal/types"
// import { RfpMetadata } from "app/rfp/types"

// // Note: Data migration scripts need to be commented out after they are used to prevent 
// // typescript errors due to schema conflicts between current and when a script was run

// // run with: blitz db seed -f db/migrations/20220825194530_move_checkbook_to_proposal_metadata/data.ts

// const seed = async () => {
//   // Copy linked checkbook addresses into rfp's proposals' metadata

//   const proposals = await db.proposal.findMany({
//     include: {
//       rfp: { include: { checkbook: true } },
//     },
//   })
//   const updates = proposals.map((proposal) => {
//     const oldMetadata = proposal.data as unknown as ProposalMetadata
//     const newMetadata = {
//       ...oldMetadata,
//       funding: {
//         ...oldMetadata.funding,
//         chainId: (proposal.rfp.data as unknown as RfpMetadata).funding.token.chainId, // copy chainId from rfp to proposal
//       },
//     }

//     return db.proposal.update({
//       where: { id: proposal.id },
//       data: {
//         data: JSON.parse(JSON.stringify(newMetadata)),
//       },
//     })
//   })

//   const res = await db.$transaction(updates)
//   console.log("proposal metadata update transaction complete", res.length)
// }

const seed = () => {}

export default seed