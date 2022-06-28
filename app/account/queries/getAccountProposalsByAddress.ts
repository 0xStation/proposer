import { computeProposalStatus } from "app/proposal/utils"
import db from "db"
import * as z from "zod"
import { Account } from "../types"

const GetAccountProposalsByAddress = z.object({
  address: z.string().optional(),
})

export default async function getAccountProposalsByAddress(
  input: z.infer<typeof GetAccountProposalsByAddress>
) {
  const data = GetAccountProposalsByAddress.parse(input)

  const account = await db.account.findFirst({
    where: { address: data.address },
    include: {
      proposals: {
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
      },
    },
  })

  if (!account) {
    return null
  }

  const accountProposals = account.proposals.map((accountProposal) => {
    return {
      ...accountProposal,
      proposal: {
        ...accountProposal.proposal,
        status: computeProposalStatus(
          accountProposal.proposal.approvals.length,
          accountProposal.proposal.rfp.checkbook?.quorum as number
        ),
      },
    }
  })

  return {
    ...account,
    proposals: accountProposals,
  } as unknown as Account
}
