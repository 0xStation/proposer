import { PrivyClient } from "@privy-io/privy-node"
import { Account } from "app/account/types"
import { Proposal } from "app/proposal/types"
import { Rfp } from "app/rfp/types"
import { Terminal } from "app/terminal/types"
import { requireEnv } from "./requireEnv"
import { Routes } from "blitz"

const client = new PrivyClient(requireEnv("PRIVY_API_KEY"), requireEnv("PRIVY_API_SECRET"))

const set = async (address: string, email: string) => {
  const [res] = await client.put(address, [{ field: "email", value: email }])
  return res?.text()
}

const get = async (address: string) => {
  const [email] = await client.get(address, ["email"])
  return email?.text()
}

const send = async (address: string, subject: string, body: string) => {
  try {
    await client.sendEmail(address, subject, body)
  } catch (e) {
    console.error(e)
  }
}

const generalBody = (message: string) => {
  return `
    <p>
      Hello,
    </p>
    <p>
      ${message}
    </p>
    <p>
      Station Staff
    </p>
    <p>
      -
    </p>
    <div style="color:grey">
      <p>
        <b>Follow along</b>
      </p>
      <p>
        Follow us on <a href="https://twitter.com/0xstation">Twitter</a> 
        to be the first to know about our latest product releases and how to participate in our ecosystem.
      </p>
      <p>
        <b>Got feedback?</b>
      </p>
      <p>
        Reach out to us at staff@station.express.
      </p>
    </div>
  `
}

type EmailArgs = {
  account?: Account
  proposal?: Proposal
  rfp?: Rfp
  terminal?: Terminal
}

const newProposalBody = ({ account, proposal, rfp, terminal }: EmailArgs) => {
  const proposerProfileUrl = `https://app.station.express/profile/${account?.address}`
  const proposerName = account?.data?.name
  const proposalUrl = `https://app.station.express/terminal/${terminal?.handle}/bulletin/rfp/${rfp?.id}/proposals/${proposal?.id}`
  const proposalTitle = proposal?.data?.content.title
  const rfpTitle = rfp?.data?.content.title
  const message = `
      <a href="${proposerProfileUrl}">${proposerName}</a>
      has submitted 
      <a href="${proposalUrl}">"${proposalTitle}"</a> to ${rfpTitle}. 
      Find out how they want to contribute to your ecosystem, and help bring their ideas to reality.
  `
  return generalBody(message)
}

const approvedProposalBody = ({ proposal, rfp, terminal }: EmailArgs) => {
  const proposalUrl = `https://app.station.express/terminal/${terminal?.handle}/bulletin/rfp/${rfp?.id}/proposals/${proposal?.id}`
  const message = `
      Congratulations! Your proposal has been approved. Next, 
      <a href="${proposalUrl}">cash your check</a>
      to complete the process and bring your ideas to reality.
    `
  return generalBody(message)
}

const templates = {
  newProposal: {
    subject: "You've received a new proposal!",
    body: newProposalBody,
  },
  approvedProposal: {
    subject: "Congratulations! Your proposal has been approved.",
    body: approvedProposalBody,
  },
}

export { set, get, send, templates }
