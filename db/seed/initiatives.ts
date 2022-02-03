import db from "../index"
import { Initiative, InitiativeMetadata } from "app/initiative/types"
import { Symbol } from "app/types"
import { stationContributors as contributors } from "./contributors"

const contributorReviewMetadata: InitiativeMetadata & { localId: number } = {
  localId: 1,
  name: "Contributor Review",
  oneLiner: "Peer-to-peer recognition that publicizes your proof of contribution.",
  shortName: "CONTRIBUTOR REVIEW",
  isAcceptingApplications: false,
  contributeText: [
    "Contributor Review looks to create a peer-to-peer oracle that signal the distribution of trust and responsibility across the network. In absence of a centralized management team, we need to design a system that adapts dynamically to the emergent behaviors of contributors. Through the act of elevating one another, we’re collectively getting close to a consensus who has contributed the most value to the organization. Our goal is to design an autonomous system that not only reflects the aggregated opinion across the network, but also protects against bad behaviors.",
  ],
  rewardText: ["Monthly salary in USDC", "Station Commuter Ticket NFT"],
  skills: ["Solidity"],
  commitment: "Full-time, Part-time",
  bannerURL: "/contributor-review-banner.png",
  links: [{ symbol: Symbol.GITHUB, url: "https://github.com/0xStation/protocol-v1" }],
  // members: [
  //   contributors.conner.address,
  //   contributors.calvin.address,
  //   contributors.kristen.address,
  //   contributors.nick.address,
  // ],
}
const waitingRoomMetadata: InitiativeMetadata & { localId: number } = {
  localId: 2,
  name: "Waiting Room",
  shortName: "WAITING ROOM",
  oneLiner:
    "Product to empower organizations with decentralized hiring and Station's first launch.",
  contributeText: [
    "The traditional hiring process as we know it no longer aligns well the increasingly permissionless and digitally-native work, where community-driven proof-of-work matters more than institutional affiliations and overly-theoretical credentials.",
    "Waiting Room enables community members to endorse anyone who expresses their interests in joining an initiative of a community. With some proof-of-work and value, contributors can signal their desire to work. Rather than a top-down recruiting process, the community, based on their roles and commitment, can collectively signal whether to “promote” the contributor and sometimes invite them to be a part of the core team. By making hiring influence more contribution-driven and participatory, we hope to help organizations grow more healthily and make access to opportunities more meritocratic.",
  ],
  rewardText: ["Monthly salary in USDC", "Station Commuter Ticket NFT"],
  skills: ["Solidity", "Front-end", "Back-end", "Product Design", "Data Analytics", "Subgraph"],
  commitment: "Full-time, Part-time",
  isAcceptingApplications: false,
  bannerURL: "/waiting-room-banner.png",
  links: [{ symbol: Symbol.GITHUB, url: "https://github.com/0xStation/web" }],
  // members: [
  //   contributors.mind.address,
  //   contributors.kristen.address,
  //   contributors.michael.address,
  //   contributors.abe.address,
  //   contributors.conner.address,
  //   contributors.brendan.address,
  //   contributors.tina.address,
  // ],
}
const newstandMetadata: InitiativeMetadata & { localId: number } = {
  localId: 3,
  name: "Newstand",
  shortName: "NEWSTAND",
  oneLiner:
    "Publication focused on exploring the possibilities of work in an era of hyper connectivity and fluidity.",
  isAcceptingApplications: true,
  contributeText: [
    "Working on the Internet is hardly something new. While crypto unlocks new primitives for work to be done on the Internet, the exuberant optimism obfuscates the day-to-day conditions, operating details, and human stories behind each contributor.",
    "From gaming forums in the 90s to Discord channels for NFT projects, people come together on the Internet to find others with shared passions. Web3 isn't changing that very fact, but it did add an additional layer of economic value whose impact can no longer be overlooked. Introducing a highly liquid financial layer leads to a three-body problem — where price, purpose, and politics intertwine to unlock something completely unknown to the past.",
    "We're calling for writers, artists, technologists, and researchers across all disciplines to push forward radical imaginations around the future of work unlocked by crypto while critically examine the current state of existence through a human lens.",
    "We are a decentralized media publication where every contributor will have ownership over the work they create while sharing the upside from the piece fairly.",
  ],
  links: [{ symbol: Symbol.MIRROR, url: "https://station.mirror.xyz/" }],
  rewardText: ["800 USDC", "Station Visitor Ticket NFT"],
  bannerURL: "/newstand-banner.png",
  commitment: "One-time",
  skills: ["Writing", "Graphic Design", "Editorial Design"],
  // members: [contributors.tina.address, contributors.alli.address],
}

const partnershipMetadata: InitiativeMetadata & { localId: number } = {
  localId: 4,
  name: "Terminal Partnerships",
  oneLiner: "Inviting the best DAOs to mobilize contributors on Station.",
  shortName: "PARTNERSHIP",
  isAcceptingApplications: false,
  contributeText: [
    "Station exists to serve contributors. We exist to surface the most interesting opportunities for a wide range of skill sets and interests. First, we need to bootstrap the supply side of the market by inviting the best DAOs to mobilize contributors on Station.",
    "In the early stages of Station’s product and protocol development, Terminal Partnerships have three primary goals: build ecosystem trust and awareness, crystallize Station’s product-market-fit, and battle test our products and protocols IRL.",
    "Our product and protocol development philosophy is “show, don’t tell”. We demonstrate the value of our protocols and products by using them to power Station’s own operations. In the long run, the value of the Station Network is the aggregate of the strength of Station’s relationships with each of our Terminal partners. By partnering early with values-aligned communities, we ensure that we’re designing the infrastructure that can serve contributors from diverse backgrounds.",
  ],
  rewardText: ["Monthly salary in USDC", "Station Commuter Ticket NFT"],
  skills: ["Writing", "Partnerships"],
  commitment: "One-time, Part-time",
  bannerURL: "/terminal-partnership-banner.png",
  links: [],
  // members: [
  //   contributors.tina.address,
  //   contributors.mind.address,
  //   contributors.alex.address,
  //   contributors.kassen.address,
  // ],
}

const networkSustainability: InitiativeMetadata & { localId: number } = {
  localId: 5,
  name: "Network Sustainability",
  oneLiner: "Designing a sustainable economic engine for the Station Network.",
  contributeText: [
    "Station looks to become a decentralized contributor network and marketplace. How can we incentivize all participants to become curators and nurturers of the network? How does value accrue to our network, our protocols, and our products? These are the fundamental questions that the Network Sustainability group aims to solve.",
    "The Station Network will be governed by the RAIL token. The token will power a sustainable RAIL network with aligned incentives and ensure fair distribution to all its participants based on their contribution to the network — be it labor or capital.",
  ],
  rewardText: ["Monthly salary in USDC", "Station Commuter Ticket NFT"],
  shortName: "NETWORK SUSTAINABILITY",
  skills: [
    "Python",
    "Data Analytics",
    "Token Design",
    "Dune Analytics",
    "Economic Design",
    "Quantitative Analysis",
  ],
  commitment: "One-time, Part-time",
  isAcceptingApplications: false,
  links: [],
  bannerURL: "/network-sustainability-banner.png",
  // members: [contributors.calvin.address, contributors.nick.address, contributors.tina.address],
}

const contributorExperience: InitiativeMetadata & { localId: number } = {
  localId: 6,
  name: "Community",
  oneLiner: "Welcoming new contributors and fostering a culture of intellectual thoughtfullness.",
  shortName: "CONTRIBUTOR EXPERIENCE",
  contributeText: [
    "From the first touch point with the Station community to the day they eventually depart, we want to push ourselves to refine every step of the journey to delight, inform, inspire, and amplify.",
    "We’re here to delight newcomers with Station’s breadth and diversity of skills and perspectives. We’re here to inform ways to get involved and align on our operational principles and philosophy. We’re here to inspire innovations on the edge of the industry through bold and rigorous questioning. We’re here to amplify those that have made a mark on our journey, no matter if they’re here for a week or a year.",
    "The initiative produces important operating documentation and workflows to ensure that we provide such experience to everyone we onboard.",
  ],
  rewardText: ["Monthly salary in USDC", "Station Commuter Ticket NFT"],
  skills: ["Discord", "Community Management", "HR", "Mod"],
  isAcceptingApplications: false,
  bannerURL: "/contributor-experience-banner.png",
  links: [],
  // members: [contributors.kassen.address, contributors.tina.address],
}

const midnightStation: InitiativeMetadata & { localId: number } = {
  localId: 7,
  name: "Midnight Station",
  oneLiner: "Radio show highlighting Station punks and passengers.",
  shortName: "MIDNIGHT STATION",
  contributeText: [
    "When Station’s contributors get together irl, the gaps in-between web3 are filled with energetic heart-to-hearts and stories of inspiration and resolution. While these conversations aren’t directly tied to the metaverse, they’ve fueled a refreshing take on what Station can provide for its community.",
    "We don’t want these conversations to end because we are collectively dispersed and draft agendas solely focused on what happens online. As Station grows its contributor network, the opportunity to generate a richer web of thought is at-hand. Midnight Station is Station’s first step to blurring the line on what it means to be  web3 and hosts a home away from home to effect ranging conversations and ideas that are top of mind.",
    "We encourage contributors from all backgrounds to come hang out, listen in, and/or provide your unique cultural point of view. It’s a rough sketch, but this is only the start.",
  ],
  rewardText: ["Monthly salary in USDC", "Station Commuter Ticket NFT"],
  skills: ["Sound Editing", "Communication"],
  isAcceptingApplications: false,
  links: [],
  bannerURL: "/midnight-station-banner.png",
  // members: [
  //   contributors.brendan.address,
  //   contributors.kristen.address,
  //   contributors.abe.address,
  //   contributors.michael.address,
  // ],
}

const brandIdentity: InitiativeMetadata & { localId: number } = {
  localId: 8,
  name: "Brand Identity",
  oneLiner: "Architecting the visual system of Station.",
  shortName: "BRAND IDENTITY",
  contributeText: [
    "Station” as a concept was born on a morning subway ride, surrounded by commuters heading uptown to their respective workplaces. It embodies not only how we’re transporting talent to the future of work that’s more participatory and permissionless, but also the freedom and mobility that the very future will unlock.",
    "From Shibuya station floorplan and NYC subway system to Neon Genesis Evangelion and David Bowie’s Station to Station, we draw inspirations from all sorts of mediums and experiences and weave them into a coherent theme of “retro-futuristic.",
  ],
  rewardText: ["Project-based in USDC", "Station Commuter Ticket NFT"],
  skills: ["Graphic Design", "Creative Direction", "Animation", "Illustration"],
  isAcceptingApplications: false,
  links: [],
  bannerURL: "/brand-identity-banner.png",
  // members: [contributors.mind.address],
}

const stationDigest: InitiativeMetadata & { localId: number } = {
  localId: 9,
  name: "Station Digest",
  oneLiner:
    "Surfacing impactful contributions and thoughtful discussions from different corners of Station.",
  shortName: "STATION DIGEST",
  contributeText: [
    "We know that commuters, visitors, and staff at Station have busy lives. In the hustle and bustle of daily work in web3, filtering through Discord channels and attempting to follow different projects or conversations can appear impossible.",
    "We don’t want those important conversations, project updates, and nuggets of wisdom to get lost in the noise, so we created Station Digest. This bi-weekly newsletter is created by, and for members of Station’s vibrant community. It summarizes updates from Station’s guilds, thoughtful conversations from the depths of Discord, all the best reads, and exciting announcements or achievements from members of our community– all in a quick, commute or morning-coffee-friendly read for you to digest at your leisure.",
  ],
  commitment: "Part-time",
  rewardText: ["Monthly salary in USDC", "Station Commuter Ticket NFT"],
  skills: ["Writing"],
  isAcceptingApplications: false,
  links: [],
  bannerURL: "/brand-identity-banner.png",
  // members: [contributors.alex.address, contributors.alli.address],
}

const stationInitiaitves = [
  contributorReviewMetadata,
  waitingRoomMetadata,
  newstandMetadata,
  partnershipMetadata,
  networkSustainability,
  contributorExperience,
  midnightStation,
  brandIdentity,
  stationDigest,
]

export async function seedInitiatives(terminals) {
  terminals.station.initiatives = {}
  for (const name in stationInitiaitves) {
    const initiative = stationInitiaitves[name]
    const ret = await db.initiative.upsert({
      where: {
        terminalInitiative: {
          terminalTicket: terminals.station.ticketAddress,
          localId: initiative!.localId,
        },
      },
      create: {
        terminalTicket: terminals.station.ticketAddress,
        terminalId: terminals.station.id,
        localId: initiative!.localId,
        data: initiative,
      },
      update: { data: initiative },
    })
    console.log(`  ${(ret as Initiative).data?.name} localId: ${ret.localId}`)
    terminals.station.initiatives[ret.localId] = ret
  }
  return terminals
}
