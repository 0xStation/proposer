import db from "../../index"
import { InitiativeMetadata } from "app/initiative/types"

type InitiativeSeed = {
  localId: number
  data: InitiativeMetadata
}

export const initiativeIds = {
  contributorReview: 1,
}

const contributorReview: InitiativeSeed = {
  localId: initiativeIds.contributorReview,
  data: {
    name: "Contributor Review",
    oneLiner: "Peer-to-peer recognition that publicizes your proof of contribution.",
    isAcceptingApplications: false,
    contributeText: [
      "Contributor Review looks to create a peer-to-peer oracle that signal the distribution of trust and responsibility across the network. In absence of a centralized management team, we need to design a system that adapts dynamically to the emergent behaviors of contributors. Through the act of elevating one another, we’re collectively getting close to a consensus who has contributed the most value to the organization. Our goal is to design an autonomous system that not only reflects the aggregated opinion across the network, but also protects against bad behaviors.",
    ],
    rewardText: ["Monthly salary in USDC", "Station Commuter Ticket NFT"],
    skills: ["solidity", "subgraph", "backend", "frontend", "design", "quantitative analysis"],
    commitment: "Full-time, Part-time",
    bannerURL: "/contributor-review-banner.png",
    links: [],
  },
}

const seed = async () => {
  const initiatives = [contributorReview]
  const terminal = await db.terminal.findUnique({ where: { handle: "stationlabs" } })

  if (!terminal) {
    console.log("no terminal with handle 'stationlabs' is found.")
    return
  }

  for (const name in initiatives) {
    const initiativeSeed = initiatives[name]! as InitiativeSeed
    await db.initiative.create({
      data: {
        terminalId: terminal.id,
        ...initiativeSeed,
      },
    })
  }
}

export default seed
