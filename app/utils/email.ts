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

  console.log("email", res)
  return res?.text()
}

const get = async (address: string) => {
  const [email] = await client.get(address, ["email"])
  console.log(email?.text())
  return email?.text()
}

const send = async (address: string, subject: string, body: string) => {
  await client.sendEmail(address, subject, body)
}

const newProposalBody = (account: Account, proposal: Proposal, rfp: Rfp, terminal: Terminal) => {
  const proposerProfileUrl = `https://app.station.express/profile/${account.address}`
  const proposerName = account.data?.name
  const proposalUrl = `https://app.station.express/terminal/${terminal.handle}/bulletin/rfp/${rfp.id}/proposals/${proposal.id}`
  const proposalTitle = proposal.data?.content.title
  const rfpTitle = rfp.data?.content.title
  return `
    <p>
      Hello,
    </p>
    <p>
      <a href="${proposerProfileUrl}">${proposerName}</a>
      has submitted 
      <a href="${proposalUrl}">"${proposalTitle}"</a> to ${rfpTitle}. 
      Find out how they want to contribute to your ecosystem, and help bring their ideas to reality.
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

export { set, get, send, newProposalBody }
