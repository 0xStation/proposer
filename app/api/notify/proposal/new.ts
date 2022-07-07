import db from "db"
import * as z from "zod"
import * as email from "app/utils/email"
import { Account, AccountMetadata } from "app/account/types"
import { Proposal } from "app/proposal/types"
import { Rfp } from "app/rfp/types"
import { Terminal } from "app/terminal/types"
import { Checkbook } from "app/checkbook/types"

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

  try {
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

    const recipientAccounts = await db.account.findMany({
      where: {
        address: {
          in: data.proposal.rfp.checkbook.signers,
        },
      },
    })

    if (!data) {
      res.status(404)
      return
    }

    try {
      await email.sendNewProposalEmail({
        recipients: recipientAccounts
          .map((account) => (account.data as AccountMetadata)?.email || "")
          .filter((s) => !!s),
        account: data.account,
        proposal: data.proposal,
        rfp: data.proposal.rfp,
        terminal: data.proposal.rfp.terminal,
      })
    } catch (e) {
      console.error(e)
      res.status(500).json({ response: "error", message: "error encountered in email emission" })
    }
  } catch (e) {
    console.error(e)
    res.status(500).json({ response: "error", message: "error encountered in data parsing" })
  }

  res.status(200).json({ response: "success" })
}