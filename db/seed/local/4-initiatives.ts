import db from "../../index"
import { InitiativeMetadata } from "app/v1/initiative/types"
import { Symbol } from "app/types"
import { CustomElement } from "app/v1/initiative/types"

type InitiativeSeed = {
  localId: number
  data: InitiativeMetadata
}

export const initiativeIds = {
  contributorReview: 1,
  waitingRoom: 2,
  newstand: 3,
  partnership: 4,
  networkSustainability: 5,
  community: 6,
  midnightStation: 7,
  brandIdentity: 8,
  stationDigest: 9,
}

const defaultAbout: CustomElement[] = [
  {
    type: "paragraph",
    children: [{ text: "Default about field." }],
  },
]

const contributorReview: InitiativeSeed = {
  localId: initiativeIds.contributorReview,
  data: {
    status: "Active",
    about: defaultAbout,
    name: "Contributor Review",
    oneLiner: "Peer-to-peer recognition that publicizes your proof of contribution.",
    isAcceptingApplications: true,
    rewardText: ["Monthly salary in USDC", "Station Commuter Ticket NFT"],
    skills: ["solidity", "subgraph", "backend", "frontend", "design", "quantitative analysis"],
    commitment: "Full-time, Part-time",
    bannerURL: "/banners/contributor-review.png",
    links: [],
  },
}
const waitingRoom: InitiativeSeed = {
  localId: initiativeIds.waitingRoom,
  data: {
    status: "Active",
    about: defaultAbout,
    name: "Waiting Room",
    oneLiner:
      "Product to empower organizations with decentralized hiring and Station's first launch.",
    rewardText: ["Monthly salary in USDC", "Station Commuter Ticket NFT"],
    skills: ["solidity", "frontend", "backend", "product design", "data analytics", "subgraph"],
    commitment: "Full-time, Part-time",
    isAcceptingApplications: false,
    bannerURL: "/banners/waiting-room.png",
    links: [],
  },
}
const newstand: InitiativeSeed = {
  localId: initiativeIds.newstand,
  data: {
    status: "Active",
    about: defaultAbout,
    name: "Newstand",
    oneLiner:
      "Publication focused on exploring the possibilities of work in an era of hyper connectivity and fluidity.",
    isAcceptingApplications: true,
    links: [{ symbol: Symbol.MIRROR, url: "https://station.mirror.xyz/" }],
    rewardText: ["Starting from 800 USDC", "Station Visitor Ticket NFT"],
    bannerURL: "/banners/newstand.png",
    commitment: "One-time",
    skills: ["writing", "graphic design", "editorial design"],
  },
}
const partnership: InitiativeSeed = {
  localId: initiativeIds.partnership,
  data: {
    status: "Active",
    about: defaultAbout,
    name: "Terminal Partnerships",
    oneLiner: "Inviting the best DAOs to mobilize contributors on Station.",
    isAcceptingApplications: false,
    rewardText: ["Monthly salary in USDC", "Station Commuter Ticket NFT"],
    skills: ["writing", "partnerships"],
    commitment: "One-time, Part-time",
    bannerURL: "/banners/terminal-partnerships.png",
    links: [],
  },
}
const networkSustainability: InitiativeSeed = {
  localId: initiativeIds.networkSustainability,
  data: {
    status: "Active",
    about: defaultAbout,
    name: "Network Sustainability",
    oneLiner: "Designing a sustainable economic engine for the Station Network.",
    rewardText: ["Monthly salary in USDC", "Station Commuter Ticket NFT"],
    skills: [
      "python",
      "data analytics",
      "dune analytics",
      "quantitative analysis",
      "economic design",
      "token design",
    ],
    commitment: "One-time, Part-time",
    isAcceptingApplications: false,
    bannerURL: "/banners/network-sustainability.png",
    links: [],
  },
}
const community: InitiativeSeed = {
  localId: initiativeIds.community,
  data: {
    status: "Active",
    about: defaultAbout,
    name: "Contributor Experience",
    oneLiner: "Welcoming new contributors and fostering a culture of intellectual thoughtfullness.",
    rewardText: ["Monthly salary in USDC", "Station Commuter Ticket NFT"],
    skills: ["discord", "community management", "hr", "moderation"],
    isAcceptingApplications: false,
    bannerURL: "/banners/contributor-experience.png",
    links: [],
  },
}
const midnightStation: InitiativeSeed = {
  localId: initiativeIds.midnightStation,
  data: {
    status: "Active",
    about: defaultAbout,
    name: "Midnight Station",
    oneLiner: "Radio show highlighting Station punks and passengers.",

    rewardText: ["Monthly salary in USDC", "Station Commuter Ticket NFT"],
    skills: ["sound editing", "communication"],
    isAcceptingApplications: false,
    links: [],
    bannerURL: "/banners/midnight-station.png",
  },
}
const brandIdentity: InitiativeSeed = {
  localId: initiativeIds.brandIdentity,
  data: {
    status: "Active",
    about: defaultAbout,
    name: "Brand Identity",
    oneLiner: "Architecting the visual system of Station.",
    rewardText: ["Project-based in USDC", "Station Commuter Ticket NFT"],
    skills: ["graphic design", "creative direction", "animation", "illustration"],
    isAcceptingApplications: false,
    links: [],
    bannerURL: "/banners/brand-identity.png",
  },
}
const stationDigest: InitiativeSeed = {
  localId: initiativeIds.stationDigest,
  data: {
    status: "Active",
    about: defaultAbout,
    name: "Station Digest",
    oneLiner:
      "Surfacing impactful contributions and thoughtful discussions from different corners of Station.",
    commitment: "Part-time",
    rewardText: ["Monthly salary in USDC", "Station Commuter Ticket NFT"],
    skills: ["writing", "organization"],
    isAcceptingApplications: false,
    links: [],
    bannerURL: "/banners/digest.png",
  },
}

const seed = async () => {
  const initiatives = [
    contributorReview,
    waitingRoom,
    newstand,
    partnership,
    networkSustainability,
    community,
    midnightStation,
    brandIdentity,
    stationDigest,
  ]
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
