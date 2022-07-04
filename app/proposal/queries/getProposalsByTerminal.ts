import db from "db"
import * as z from "zod"
import { Proposal } from "../types"

const GetProposalsByTerminal = z.object({
  terminalId: z.number(),
})

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
    },
    include: {
      rfp: {
        include: {
          checkbook: true,
        },
      },
      checks: true,
    },
  })

  return proposals as unknown as Proposal[]
}
