import db from "db"
import * as z from "zod"
import * as email from "app/utils/email"
import { Account, AccountMetadata } from "app/account/types"
import { Proposal } from "app/proposal/types"
import { Rfp } from "app/rfp/types"
import { Terminal } from "app/terminal/types"

const EmailRequest = z.object({
  proposalId: z.string(),
})

// TODO: currently unprotected, need to only allow requests from frontend
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
      collaborators: {
        include: {
          account: true,
        },
      },
      rfp: {
        include: {
          terminal: true,
        },
      },
    },
  })) as unknown as Proposal & {
    collaborators: { account: Account }[]
    rfp: Rfp & { terminal: Terminal }
  }

  if (!data) {
    res.status(404)
    return
  }

  await email.approvedProposal({
    recipients: data.collaborators
      .map((ap) => (ap.account?.data as AccountMetadata)?.email || "")
      .filter((s) => !!s),
    proposal: data,
    rfp: data.rfp,
    terminal: data.rfp.terminal,
  })

  res.status(200).json({ response: "success" })
}
