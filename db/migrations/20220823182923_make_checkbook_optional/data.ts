import { ProposalMetadata } from "app/proposal/types"
import { RfpMetadata } from "app/rfp/types"
import { AddressType } from "app/types"
import db from "../../index"
import { ProposalStatus as PrismaProposalStatus } from "@prisma/client"

// run with: blitz db seed -f db/migrations/20220823182923_make_checkbook_optional/data.ts

// Note: Data migration scripts need to be commented out to prevent typescript errors 
//       due to schema conflicts between latest and the time when a script is used

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
//         senderType: AddressType.CHECKBOOK,
//         senderAddress: proposal.rfp.checkbook.address,
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

//   const res = await db.$transaction(updates)
//   console.log("proposal metadata update transaction complete", res.length)
// }

// export default seed