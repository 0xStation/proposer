import { requireEnv } from "./requireEnv"
import { MailService as SendGrid } from "@sendgrid/mail"
import { SENDGRID_TEMPLATES } from "app/core/utils/constants"
import { getUrlHost } from "app/utils/getUrlHost"
import truncateString from "app/core/utils/truncateString"

const sendgrid = new SendGrid()
sendgrid.setApiKey(requireEnv("SENDGRID_API_KEY"))
const hostname = getUrlHost()

type EmailArgs = {
  recipients: string[]
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

const sendNewProposalEmail = async ({ recipients, account, proposal }) => {
  const dynamicTemplateData = {
    proposerProfileUrl: `${hostname}/workspace/${account?.address}`,
    proposerName: account?.data?.name || truncateString(account?.address),
    proposalUrl: `${hostname}/proposal/${proposal?.id}`,
    proposalTitle: proposal?.data?.content.title,
  }

  await email(recipients, SENDGRID_TEMPLATES.NEW_PROPOSAL, dynamicTemplateData)
}

// const sendApprovedProposalEmail = async ({ recipients, proposal, rfp, terminal }: ProposalArgs) => {
//   const dynamicTemplateData = {
//     proposalUrl: `${hostname}/station/${terminal?.handle}/bulletin/project/${rfp?.id}/proposals/${proposal?.id}`,
//   }

//   await email(recipients, SENDGRID_TEMPLATES.APPROVED_PROPOSAL, dynamicTemplateData)
// }

const sendVerificationEmail = async ({ recipients, verificationCode }: VerificationEmailArgs) => {
  const dynamicTemplateData = {
    verificationUrl: `${hostname}/verify/email?code=${verificationCode}`,
  }

  await email(recipients, SENDGRID_TEMPLATES.VERIFY, dynamicTemplateData)
}

export { sendVerificationEmail, sendNewProposalEmail }
