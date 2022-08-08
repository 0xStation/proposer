import { ProposalStatus } from "app/proposal/types"
// import { computeProposalStatus } from "app/proposal/utils"
import db from "db"
import * as z from "zod"
import { Account } from "../types"

const GetAccountProposalsByAddress = z.object({
  address: z.string(),
})

export default async function getAccountProposalsByAddress(
  input: z.infer<typeof GetAccountProposalsByAddress>
) {
  const data = GetAccountProposalsByAddress.parse(input)

  const accountProposals = await db.accountProposal.findMany({
    where: { address: data.address },
    include: {
      terminal: true,
      proposal: {
        include: {
          rfp: true,
        },
      },
    },
  })

  const accountProposalsWithProductStatus = accountProposals.map((accountProposal) => {
    return {
      ...accountProposal,
      proposal: {
        ...accountProposal.proposal,
        status: ProposalStatus.SUBMITTED,
      },
    }
  })

  return accountProposalsWithProductStatus

  return accountProposals
}
