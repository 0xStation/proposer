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
}

type ProposalArgs = EmailArgs & {
  account?: Account
  proposal?: Proposal
  rfp?: Rfp
  terminal?: Terminal
}

type VerificationEmailArgs = EmailArgs & {
  verificationCode: string
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
}: ProposalArgs) => {
  const dynamicTemplateData = {
    proposerProfileUrl: `${hostname}/profile/${account?.address}`,
    proposerName: account?.data?.name || truncateString(account?.address),
    proposalUrl: `${hostname}/station/${terminal?.handle}/bulletin/project/${rfp?.id}/proposals/${proposal?.id}`,
    proposalTitle: proposal?.data?.content.title,
    rfpTitle: rfp?.data?.content.title,
  }

  await email(recipients, SENDGRID_TEMPLATES.NEW_PROPOSAL, dynamicTemplateData)
}

const sendApprovedProposalEmail = async ({ recipients, proposal, rfp, terminal }: ProposalArgs) => {
  const dynamicTemplateData = {
    proposalUrl: `${hostname}/station/${terminal?.handle}/bulletin/project/${rfp?.id}/proposals/${proposal?.id}`,
  }

  await email(recipients, SENDGRID_TEMPLATES.APPROVED_PROPOSAL, dynamicTemplateData)
}

const sendVerificationEmail = async ({ recipients, verificationCode }: VerificationEmailArgs) => {
  const dynamicTemplateData = {
    verificationUrl: `${hostname}/verify/email?code=${verificationCode}`,
  }

  await email(recipients, SENDGRID_TEMPLATES.VERIFY, dynamicTemplateData)
}

export { sendNewProposalEmail, sendApprovedProposalEmail, sendVerificationEmail }
