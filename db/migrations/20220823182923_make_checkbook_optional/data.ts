import { ProposalMetadata } from "app/proposal/types"
import { RfpMetadata } from "app/rfp/types"
import { FundingSenderType } from "app/types"
import db from "../../index"
import { ProposalStatus as PrismaProposalStatus } from "@prisma/client"

// // run with: blitz db seed -f db/data-migrations/2-checkbook-optional.ts
const seed = async () => {
  // 1. Copy linked checkbook address into rfp's metadata

  const rfps = await db.rfp.findMany()
  const rfpUpdates = rfps.map((rfp) => {
    const oldMetadata = rfp.data as unknown as RfpMetadata
    const newMetadata = {
      ...oldMetadata,
      funding: {
        ...oldMetadata.funding,
        senderType: FundingSenderType.CHECKBOOK,
        senderAddress: rfp.fundingAddress,
      },
    }

    return db.rfp.update({
      where: { id: rfp.id },
      data: {
        data: JSON.parse(JSON.stringify(newMetadata)),
      },
    })
  })

  const res1 = await db.$transaction(rfpUpdates)
  console.log("rfp metadata update transaction complete", res1.length)

  // 2. Copy linked checkbook addresses into rfp's proposals' metadata

  const proposals = await db.proposal.findMany({
    include: {
      rfp: { include: { checkbook: true } },
    },
  })
  const proposalUpdates1 = proposals.map((proposal) => {
    const oldMetadata = proposal.data as unknown as ProposalMetadata
    const newMetadata = {
      ...oldMetadata,
      funding: {
        ...oldMetadata.funding,
        senderType: FundingSenderType.CHECKBOOK,
        senderAddress: proposal.rfp.checkbook.address,
        chainId: proposal.rfp.checkbook.chainId,
      },
    }

    return db.proposal.update({
      where: { id: proposal.id },
      data: {
        data: JSON.parse(JSON.stringify(newMetadata)),
      },
    })
  })

  const res2 = await db.$transaction(proposalUpdates1)
  console.log("proposal metadata update transaction complete", res2.length)
}

export default seed