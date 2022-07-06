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

  const data = (await db.proposal.findUnique({
    where: {
      id: params.proposalId,
    },
    include: {
      collaborators: true,
      rfp: {
        include: {
          terminal: true,
        },
      },
    },
  })) as unknown as Proposal & {
    collaborators: Account[]
    rfp: Rfp & { terminal: Terminal }
  }

  if (!data) {
    res.status(404)
    return
  }

  const subject = email.templates.approvedProposal.subject
  const body = email.templates.approvedProposal.body({
    proposal: data,
    rfp: data.rfp,
    terminal: data.rfp.terminal,
  })

  data.collaborators.forEach((account) => {
    email.send(account.address, subject, body)
  })

  res.status(200).json({ response: "success" })
}
