import { Account } from "app/account/types"
import { Proposal } from "app/proposal/types"
import { Rfp } from "app/rfp/types"
import { Terminal } from "app/terminal/types"
import { requireEnv } from "./requireEnv"
import { MailService as SendGrid } from "@sendgrid/mail"
import { SENDGRID_TEMPLATES } from "app/core/utils/constants"

const sendgrid = new SendGrid()
sendgrid.setApiKey(requireEnv("SENDGRID_API_KEY"))

type EmailArgs = {
  recipients: string[]
  account?: Account
  proposal?: Proposal
  rfp?: Rfp
  terminal?: Terminal
}

// TODO: make dynamic
const urlDomain = "https://app.station.express"

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

const newProposal = async ({ recipients, account, proposal, rfp, terminal }: EmailArgs) => {
  const dynamicTemplateData = {
    proposerProfileUrl: `${urlDomain}/profile/${account?.address}`,
    proposerName: account?.data?.name,
    proposalUrl: `${urlDomain}/terminal/${terminal?.handle}/bulletin/rfp/${rfp?.id}/proposals/${proposal?.id}`,
    proposalTitle: proposal?.data?.content.title,
    rfpTitle: rfp?.data?.content.title,
  }

  await email(recipients, SENDGRID_TEMPLATES.NEW_PROPOSAL, dynamicTemplateData)
}

const approvedProposal = async ({ recipients, proposal, rfp, terminal }: EmailArgs) => {
  const dynamicTemplateData = {
    proposalUrl: `${urlDomain}/terminal/${terminal?.handle}/bulletin/rfp/${rfp?.id}/proposals/${proposal?.id}`,
  }

  await email(recipients, SENDGRID_TEMPLATES.APPROVED_PROPOSAL, dynamicTemplateData)
}

export { newProposal, approvedProposal }
