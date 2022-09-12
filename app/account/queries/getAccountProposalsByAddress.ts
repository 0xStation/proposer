import db from "db"
import * as z from "zod"
import { AccountProposalWithProposalPreloaded } from "app/proposal/types"
import { ProposalStatus as ProductProposalStatus } from "app/proposal/types"
import { ProposalStatus as PrismaProposalStatus } from "@prisma/client"

const GetAccountProposalsByAddress = z.object({
  address: z.string(),
  statuses: z.string().array().optional(),
  roles: z.string().array().optional(),
})

export default async function getAccountProposalsByAddress(
  input: z.infer<typeof GetAccountProposalsByAddress>
) {
  const data = GetAccountProposalsByAddress.parse(input)

  const accountProposals = await db.accountProposal.findMany({
    where: {
      address: data.address,
    },
    include: {
      terminal: true,
      proposal: {
        include: {
          rfp: true,
        },
      },
    },
  })

  const accountProposalsWithProductStatus = accountProposals
    .filter((accountProposal) => accountProposal.proposal.status !== PrismaProposalStatus.DELETED)
    .map((accountProposal) => {
      return {
        ...accountProposal,
        proposal: {
          ...accountProposal.proposal,
          status:
            // returns db status or converts from PUBLISHED->SUBMITTED (only difference right now)
            accountProposal.proposal.status === PrismaProposalStatus.PUBLISHED
              ? ProductProposalStatus.SUBMITTED
              : accountProposal.proposal.status,
        },
      }
    }) as unknown as AccountProposalWithProposalPreloaded[]

  return accountProposalsWithProductStatus
}
