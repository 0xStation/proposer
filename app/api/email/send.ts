import db from "db"
import * as z from "zod"
import * as email from "app/utils/email"
import { Account } from "app/account/types"
import { Proposal } from "app/proposal/types"
import { Rfp } from "app/rfp/types"
import { Terminal } from "app/terminal/types"

const EmailRequest = z.object({
  proposalId: z.string(),
})

export default async function handler(req, res) {
  let params
  try {
    params = EmailRequest.parse(req.body)
  } catch (e) {
    console.log(e)
    res.status(500).json({ response: "error", message: "missing required parameter" })
  }

  const data = (await db.accountProposal.findFirst({
    where: {
      proposalId: params.proposalId,
    },
    include: {
      account: true,
      proposal: {
        include: {
          rfp: {
            include: {
              terminal: true,
            },
          },
        },
      },
    },
  })) as unknown as { account: Account; proposal: Proposal & { rfp: Rfp & { terminal: Terminal } } }

  console.log(data)

  if (!data) {
    res.status(404)
    return
  }

  email.send(
    "0xBa767D65a7164E151783e42994Bd475509F256Dd",
    "You've received a new proposal!",
    email.newProposalBody(
      data.account,
      data.proposal,
      data.proposal.rfp,
      data.proposal.rfp.terminal
    )
  )

  res.status(200).json({ response: "success" })
}
