import db from "db"
import * as z from "zod"
import * as email from "app/utils/email"
import { Account, AccountMetadata } from "app/account/types"
import { Proposal } from "app/proposal/types"
import { Rfp } from "app/rfp/types"
import { Terminal } from "app/terminal/types"
import { getEmail } from "app/utils/privy"

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
    const proposal = (await db.proposal.findUnique({
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

    if (!proposal) {
      res.status(404)
      return
    }

    try {
      const emailRequests = proposal.collaborators
        .filter((collaborator) => !!(collaborator.account?.data as AccountMetadata).hasSavedEmail) // TODO: replace with hasVerifiedEmail
        .map((collaborator) => getEmail(collaborator.account?.address as string))

      const emails = (await Promise.all(emailRequests)).map((email) => email as string)

      try {
        await email.sendApprovedProposalEmail({
          recipients: emails,
          proposal: proposal,
          rfp: proposal.rfp,
          terminal: proposal.rfp.terminal,
        })
      } catch (e) {
        console.error(e)
        res.status(500).json({ response: "error", message: "error encountered in email emission" })
      }
    } catch (e) {
      console.error(e)
      res
        .status(500)
        .json({ response: "error", message: "error encountered in email fetching for accounts" })
    }
  } catch (e) {
    console.error(e)
    res.status(500).json({ response: "error", message: "error encountered in data parsing" })
  }

  res.status(200).json({ response: "success" })
}
