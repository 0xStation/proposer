import { Account } from "app/account/types"
import { Proposal } from "app/proposal/types"
import { Rfp } from "app/rfp/types"
import { Terminal } from "app/terminal/types"
import { requireEnv } from "./requireEnv"
import { MailService as SendGrid } from "@sendgrid/mail"
import { SENDGRID_TEMPLATES } from "app/core/utils/constants"
import truncateString from "app/core/utils/truncateString"
import { getUrlHost } from "app/utils/getUrlHost"

const sendgrid = new SendGrid()
sendgrid.setApiKey(requireEnv("SENDGRID_API_KEY"))
const hostname = getUrlHost()

type EmailArgs = {
  recipients: string[]
  account?: Account
  proposal?: Proposal
  rfp?: Rfp
  terminal?: Terminal
}

const email = async (recipients: string[], templateId: string, dynamicTemplateData: any) => {
  if (recipients.length === 0) {
    console.log("no recipient emails provided")
    return
  }

  const mail = {
    to: recipients,
    isMultiple: true,
    from: {
      name: "Station",
      email: "no-reply@station.express",
    },
    templateId,
    dynamicTemplateData,
  }

  try {
    await sendgrid.send(mail)
  } catch (e) {
    console.error(e)
  }
}

const sendNewProposalEmail = async ({
  recipients,
  account,
  proposal,
  rfp,
  terminal,
}: EmailArgs) => {
  const dynamicTemplateData = {
    proposerProfileUrl: `${hostname}/profile/${account?.address}`,
    proposerName: account?.data?.name || truncateString(account?.address),
    proposalUrl: `${hostname}/terminal/${terminal?.handle}/bulletin/rfp/${rfp?.id}/proposals/${proposal?.id}`,
    proposalTitle: proposal?.data?.content.title,
    rfpTitle: rfp?.data?.content.title,
  }

  await email(recipients, SENDGRID_TEMPLATES.NEW_PROPOSAL, dynamicTemplateData)
}

const sendApprovedProposalEmail = async ({ recipients, proposal, rfp, terminal }: EmailArgs) => {
  const dynamicTemplateData = {
    proposalUrl: `${hostname}/terminal/${terminal?.handle}/bulletin/rfp/${rfp?.id}/proposals/${proposal?.id}`,
  }

  await email(recipients, SENDGRID_TEMPLATES.APPROVED_PROPOSAL, dynamicTemplateData)
}

export { sendNewProposalEmail, sendApprovedProposalEmail }
