import db from "db"
import * as z from "zod"
import * as email from "app/utils/email"
import { Account, AccountMetadata } from "app/account/types"
import { Proposal } from "app/proposal/types"
import { Rfp } from "app/rfp/types"
import { Terminal } from "app/terminal/types"
import { Checkbook } from "app/checkbook/types"
import { getEmails } from "app/utils/privy"
import { FundingSenderType } from "app/types"

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
                // checkbook: true,
              },
            },
          },
        },
      },
    })) as unknown as {
      account: Account
      proposal: Proposal & { rfp: Rfp & { terminal: Terminal } }
    }

    if (!data) {
      res.status(404)
      return
    }

    // res.status(200).json({ response: "success" })
    // return

    let addresses: string[] = []

    try {
      if (data.proposal.rfp.data.funding?.senderType === FundingSenderType.CHECKBOOK) {
        const fundingData = data.proposal.rfp.data.funding
        const checkbook = await db.checkbook.findFirst({
          where: {
            chainId: fundingData.token.chainId,
            address: fundingData.senderAddress,
          },
        })

        if (!checkbook) {
          res.status(404)
          return
        }

        const checkbookSigners = await db.account.findMany({
          where: {
            address: {
              in: checkbook?.signers || [],
            },
          },
        })

        addresses = checkbookSigners
          .filter((account) => !!(account.data as AccountMetadata).hasVerifiedEmail)
          .map((account) => account.address as string)
      }
    } catch (e) {
      console.error(e)
      res.status(500).json({
        response: "error",
        message: "error encountered in email recipient list generation",
      })
    }

    if (addresses.length === 0) {
      res.status(200).json({ response: "success" })
      return
    }

    try {
      const emails = await getEmails(addresses)

      try {
        await email.sendNewProposalEmail({
          recipients: emails,
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
