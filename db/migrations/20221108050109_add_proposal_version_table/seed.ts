import { Proposal } from "app/proposal/types"
import db, { ProposalRoleType } from "db"

const seed = async () => {
  const proposals = await db.proposal.findMany()

  await proposals.forEach(async (proposal: Proposal) => {
    const author = await db.proposalRole.findFirst({
      where: {
        proposalId: proposal?.id,
        type: ProposalRoleType.AUTHOR,
      },
    })
     await db.proposalVersion.create({
       data: {
         createdAt: proposal?.timestamp,
         editorAddress: author?.address as string,
         proposalId: proposal?.id as string,
         version: 1,
         data: {
           content: {
             title: "Version 1",
             body: undefined,
           },
           proposalSignatureMessage: proposal?.data?.signatureMessage,
           proposalHash: proposal?.data?.proposalHash,
         },
       },
     })
  })
}

export default seed
