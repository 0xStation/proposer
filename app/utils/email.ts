import { PrivyClient } from "@privy-io/privy-node"
import { Account } from "app/account/types"
import { Proposal } from "app/proposal/types"
import { Rfp } from "app/rfp/types"
import { Terminal } from "app/terminal/types"
import { requireEnv } from "./requireEnv"
import { Routes } from "blitz"
import { MailService as SendGrid } from "@sendgrid/mail"

const sendgrid = new SendGrid()
sendgrid.setApiKey(requireEnv("SENDGRID_API_KEY"))

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

const newProposal = async ({ recipients, account, proposal, rfp, terminal }: EmailArgs) => {
  const dynamicTemplateData = {
    proposerProfileUrl: `https://app.station.express/profile/${account?.address}`,
    proposerName: account?.data?.name,
    proposalUrl: `https://app.station.express/terminal/${terminal?.handle}/bulletin/rfp/${rfp?.id}/proposals/${proposal?.id}`,
    proposalTitle: proposal?.data?.content.title,
    rfpTitle: rfp?.data?.content.title,
  }

  await email(recipients, "d-a73399b0868b4dbaae6dbff04b887f53", dynamicTemplateData)
}

const approvedProposal = async ({ recipients, proposal, rfp, terminal }: EmailArgs) => {
  const dynamicTemplateData = {
    proposalUrl: `https://app.station.express/terminal/${terminal?.handle}/bulletin/rfp/${rfp?.id}/proposals/${proposal?.id}`,
  }

  await email(recipients, "d-1e84326048464c8c8277949bfde770fe", dynamicTemplateData)
}

// const client = new PrivyClient(requireEnv("PRIVY_API_KEY"), requireEnv("PRIVY_API_SECRET"))

// const set = async (address: string, email: string) => {
//   try {
//     const [res] = await client.put(address, [{ field: "email", value: email }])
//     return res?.text()
//   } catch (e) {
//     console.error(e)
//   }
// }

// const get = async (address: string) => {
//   try {
//     const [email] = await client.get(address, ["email"])
//     return email?.text()
//   } catch (e) {
//     console.error(e)
//   }
// }

// const send = async (address: string, subject: string, body: string) => {
//   try {
//     await client.sendEmail(address, subject, body)
//   } catch (e) {
//     console.error(e)
//   }
// }

// const generalBody = (message: string) => {
//   return `
//     <p>
//       Hello,
//     </p>
//     <p>
//       ${message}
//     </p>
//     <p>
//       Station Staff
//     </p>
//     <p>
//       -
//     </p>
//     <div style="color:grey">
//       <p>
//         <b>Follow along</b>
//       </p>
//       <p>
//         Follow us on <a href="https://twitter.com/0xstation">Twitter</a>
//         to be the first to know about our latest product releases and how to participate in our ecosystem.
//       </p>
//       <p>
//         <b>Got feedback?</b>
//       </p>
//       <p>
//         Reach out to us at staff@station.express.
//       </p>
//     </div>
//   `
// }

// const newProposalBody = ({ account, proposal, rfp, terminal }: EmailArgs) => {
//   const proposerProfileUrl = `https://app.station.express/profile/${account?.address}`
//   const proposerName = account?.data?.name
//   const proposalUrl = `https://app.station.express/terminal/${terminal?.handle}/bulletin/rfp/${rfp?.id}/proposals/${proposal?.id}`
//   const proposalTitle = proposal?.data?.content.title
//   const rfpTitle = rfp?.data?.content.title
//   const message = `
//       <a href="${proposerProfileUrl}">${proposerName}</a>
//       has submitted
//       <a href="${proposalUrl}">"${proposalTitle}"</a> to ${rfpTitle}.
//       Find out how they want to contribute to your ecosystem, and help bring their ideas to reality.
//   `
//   return generalBody(message)
// }

// const approvedProposalBody = ({ proposal, rfp, terminal }: EmailArgs) => {
//   const proposalUrl = `https://app.station.express/terminal/${terminal?.handle}/bulletin/rfp/${rfp?.id}/proposals/${proposal?.id}`
//   const message = `
//       Congratulations! Your proposal has been approved. Next,
//       <a href="${proposalUrl}">cash your check</a>
//       to complete the process and bring your ideas to reality.
//     `
//   return generalBody(message)
// }

// const templates = {
//   newProposal: {
//     subject: "You've received a new proposal!",
//     body: newProposalBody,
//   },
//   approvedProposal: {
//     subject: "Congratulations! Your proposal has been approved.",
//     body: approvedProposalBody,
//   },
// }

export { newProposal, approvedProposal }
