import { computeProposalStatus } from "app/proposal/utils"
import db from "db"
import * as z from "zod"
import { Account } from "../types"
import { ProposalStatus as ProductProposalStatus } from "app/proposal/types"
import { ProposalStatus as PrismaProposalStatus } from "db"

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
          rfp: {
            include: {
              checkbook: true,
            },
          },
          approvals: true,
        },
      },
    },
  })

  const accountProposalsWithProductStatus = accountProposals.map((accountProposal) => {
    return {
      ...accountProposal,
      proposal: {
        ...accountProposal.proposal,
        status:
          accountProposal.proposal.status === PrismaProposalStatus.PUBLISHED
            ? ProductProposalStatus.SUBMITTED
            : accountProposal.proposal.status,
      },
    }
  })

  return accountProposalsWithProductStatus
}
