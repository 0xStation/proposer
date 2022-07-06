import db from "db"
import * as z from "zod"
import * as email from "app/utils/email"
import { Account } from "app/account/types"
import { Proposal } from "app/proposal/types"
import { Rfp } from "app/rfp/types"
import { Terminal } from "app/terminal/types"
import { Checkbook } from "app/checkbook/types"

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
              checkbook: true,
            },
          },
        },
      },
    },
  })) as unknown as {
    account: Account
    proposal: Proposal & { rfp: Rfp & { terminal: Terminal; checkbook: Checkbook } }
  }

  if (!data) {
    res.status(404)
    return
  }

  const subject = email.templates.newProposal.subject
  const body = email.templates.newProposal.body({
    account: data.account,
    proposal: data.proposal,
    rfp: data.proposal.rfp,
    terminal: data.proposal.rfp.terminal,
  })

  data.proposal.rfp.checkbook.signers.forEach((address) => {
    email.send(address, subject, body)
  })

  res.status(200).json({ response: "success" })
}
