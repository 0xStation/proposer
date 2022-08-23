import db from "db"
import * as z from "zod"
import { Proposal } from "../types"
import { ProposalStatus as PrismaProposalStatus } from "@prisma/client"
import { ProposalStatus as ProductProposalStatus } from "../types"

const GetProposalsByTerminal = z.object({
  terminalId: z.number(),
})

// temporary use for dev tools
export default async function getProposalsByTerminal(
  input: z.infer<typeof GetProposalsByTerminal>
) {
  const terminal = await db.terminal.findUnique({
    where: {
      id: input.terminalId,
    },
    include: {
      rfps: {
        include: {
          proposals: true,
        },
      },
    },
  })

  if (!terminal) {
    return null
  }

  const ids = [].concat.apply(
    [],
    terminal.rfps.map((rfp) => rfp.proposals.map((p) => p.id))
  )

  const proposals = await db.proposal.findMany({
    where: {
      id: {
        in: ids,
      },
      NOT: [
        {
          status: PrismaProposalStatus.DELETED,
        },
      ],
    },
    include: {
      rfp: true,
      checks: true,
    },
  })

  return proposals.map((proposal) => {
    return {
      ...proposal,
      status:
        proposal.status === PrismaProposalStatus.PUBLISHED
          ? ProductProposalStatus.SUBMITTED
          : proposal.status,
    }
  }) as unknown as Proposal[]
}
