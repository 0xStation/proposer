import db from "../../index"
import { Terminal, TerminalMetadata, MethodToVisualizeContributorsNFT } from "app/terminal/types"
import { Initiative, InitiativeMetadata } from "app/initiative/types"
import { Role, RoleMetadata } from "app/role/types"
import { Symbol } from "app/types"

type TerminalSeed = {
  ticketAddress: string
  handle: string
  data: TerminalMetadata
}

type RoleSeed = {
  localId: number
  data: RoleMetadata
}

type InitiativeSeed = {
  localId: number
  data: InitiativeMetadata
}

//////
// ROLES
//////

export const roleIds = {
  staff: 1,
  dailyCommuter: 2,
  weekendCommuter: 3,
  visitor: 4,
}

//////
// TERMINAL
//////

const station: TerminalSeed = {
  handle: "stationlabs",
  ticketAddress: "0x288563ac5f82FE5d970383AB56282b8fb4E9bC79",
  data: {
    name: "Station Labs",
    description: "Creating on-chain infrastructure for a new genre of work.",
    coverURL: "https://station-images.nyc3.digitaloceanspaces.com/station-cover.png",
    pfpURL: "https://station-images.nyc3.digitaloceanspaces.com/station.jpeg",
    permissions: {
      invite: {
        [roleIds.staff]: [
          roleIds.staff,
          roleIds.dailyCommuter,
          roleIds.weekendCommuter,
          roleIds.visitor,
        ], // local id for STAFF
      },
    },
    contracts: {
      addresses: {
        endorsements: "0xABf03EDC17De11e80008C3e89919b82AbA34521A",
        points: "0x09B29bcb130E4A642f270AF3F6bDf2480D065835",
        referrals: "0x488d547e5C383d66815c67fB1356A3F35d3885CF",
      },
      symbols: {
        endorsements: "RAIL🅔",
        points: "RAIL🅟",
        referrals: "RAIL🅡",
      },
    },
    metadata: {
      imageConfig: {
        logicType: MethodToVisualizeContributorsNFT.INDIVIDUAL,
      },
    },
  },
}

const staff: RoleSeed = {
  localId: roleIds.staff,
  data: {
    name: "STAFF",
    value: "STAFF",
  },
}

const dailyCommuter: RoleSeed = {
  localId: roleIds.dailyCommuter,
  data: {
    name: "DAILY COMMUTER",
    value: "DAILY COMMUTER",
  },
}

const weekendCommuter: RoleSeed = {
  localId: roleIds.weekendCommuter,
  data: {
    name: "WEEKEND COMMUTER",
    value: "WEEKEND COMMUTER",
  },
}

const visitor: RoleSeed = {
  localId: roleIds.visitor,
  data: {
    name: "VISITOR",
    value: "VISITOR",
  },
}

const stationRoles = [
  // staff, dailyCommuter, weekendCommuter, visitor
]

//////
// INITIATIVES
//////

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
    bannerURL: "/banners/contributor-review.png",
    links: [],
  },
}
const waitingRoom: InitiativeSeed = {
  localId: initiativeIds.waitingRoom,
  data: {
    name: "Waiting Room",
    oneLiner:
      "Product to empower organizations with decentralized hiring and Station's first launch.",
    contributeText: [
      "The traditional hiring process as we know it no longer aligns well the increasingly permissionless and digitally-native work, where community-driven proof-of-work matters more than institutional affiliations and overly-theoretical credentials.",
      "Waiting Room enables community members to endorse anyone who expresses their interests in joining an initiative of a community. With some proof-of-work and value, contributors can signal their desire to work. Rather than a top-down recruiting process, the community, based on their roles and commitment, can collectively signal whether to “promote” the contributor and sometimes invite them to be a part of the core team. By making hiring influence more contribution-driven and participatory, we hope to help organizations grow more healthily and make access to opportunities more meritocratic.",
    ],
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
    name: "Newstand",
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
    rewardText: ["Starting from 800 USDC", "Station Visitor Ticket NFT"],
    bannerURL: "/banners/newstand.png",
    commitment: "One-time",
    skills: ["writing", "graphic design", "editorial design"],
  },
}
const partnership: InitiativeSeed = {
  localId: initiativeIds.partnership,
  data: {
    name: "Terminal Partnerships",
    oneLiner: "Inviting the best DAOs to mobilize contributors on Station.",
    isAcceptingApplications: false,
    contributeText: [
      "Station exists to serve contributors. We exist to surface the most interesting opportunities for a wide range of skill sets and interests. First, we need to bootstrap the supply side of the market by inviting the best DAOs to mobilize contributors on Station.",
      "In the early stages of Station’s product and protocol development, Terminal Partnerships have three primary goals: build ecosystem trust and awareness, crystallize Station’s product-market-fit, and battle test our products and protocols IRL.",
      "Our product and protocol development philosophy is “show, don’t tell”. We demonstrate the value of our protocols and products by using them to power Station’s own operations. In the long run, the value of the Station Network is the aggregate of the strength of Station’s relationships with each of our Terminal partners. By partnering early with values-aligned communities, we ensure that we’re designing the infrastructure that can serve contributors from diverse backgrounds.",
    ],
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
    name: "Network Sustainability",
    oneLiner: "Designing a sustainable economic engine for the Station Network.",
    contributeText: [
      "Station looks to become a decentralized contributor network and marketplace. How can we incentivize all participants to become curators and nurturers of the network? How does value accrue to our network, our protocols, and our products? These are the fundamental questions that the Network Sustainability group aims to solve.",
      "The Station Network will be governed by the RAIL token. The token will power a sustainable RAIL network with aligned incentives and ensure fair distribution to all its participants based on their contribution to the network — be it labor or capital.",
    ],
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
    name: "Contributor Experience",
    oneLiner: "Welcoming new contributors and fostering a culture of intellectual thoughtfullness.",
    contributeText: [
      "From the first touch point with the Station community to the day they eventually depart, we want to push ourselves to refine every step of the journey to delight, inform, inspire, and amplify.",
      "We’re here to delight newcomers with Station’s breadth and diversity of skills and perspectives. We’re here to inform ways to get involved and align on our operational principles and philosophy. We’re here to inspire innovations on the edge of the industry through bold and rigorous questioning. We’re here to amplify those that have made a mark on our journey, no matter if they’re here for a week or a year.",
      "The initiative produces important operating documentation and workflows to ensure that we provide such experience to everyone we onboard.",
    ],
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
    name: "Midnight Station",
    oneLiner: "Radio show highlighting Station punks and passengers.",
    contributeText: [
      "When Station’s contributors get together irl, the gaps in-between web3 are filled with energetic heart-to-hearts and stories of inspiration and resolution. While these conversations aren’t directly tied to the metaverse, they’ve fueled a refreshing take on what Station can provide for its community.",
      "We don’t want these conversations to end because we are collectively dispersed and draft agendas solely focused on what happens online. As Station grows its contributor network, the opportunity to generate a richer web of thought is at-hand. Midnight Station is Station’s first step to blurring the line on what it means to be  web3 and hosts a home away from home to effect ranging conversations and ideas that are top of mind.",
      "We encourage contributors from all backgrounds to come hang out, listen in, and/or provide your unique cultural point of view. It’s a rough sketch, but this is only the start.",
    ],
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
    name: "Brand Identity",
    oneLiner: "Architecting the visual system of Station.",
    contributeText: [
      "Station as a concept was born on a morning subway ride, surrounded by commuters heading uptown to their respective workplaces. It embodies not only how we’re transporting talent to the future of work that’s more participatory and permissionless, but also the freedom and mobility that the very future will unlock.",
      'From Shibuya station floorplan and NYC subway system to Neon Genesis Evangelion and David Bowie’s Station to Station, we draw inspirations from all sorts of mediums and experiences and weave them into a coherent theme of "retro-futuristic."',
    ],
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
    name: "Station Digest",
    oneLiner:
      "Surfacing impactful contributions and thoughtful discussions from different corners of Station.",
    contributeText: [
      "We know that commuters, visitors, and staff at Station have busy lives. In the hustle and bustle of daily work in web3, filtering through Discord channels and attempting to follow different projects or conversations can appear impossible.",
      "We don’t want those important conversations, project updates, and nuggets of wisdom to get lost in the noise, so we created Station Digest. This bi-weekly newsletter is created by, and for members of Station’s vibrant community. It summarizes updates from Station’s guilds, thoughtful conversations from the depths of Discord, all the best reads, and exciting announcements or achievements from members of our community– all in a quick, commute or morning-coffee-friendly read for you to digest at your leisure.",
    ],
    commitment: "Part-time",
    rewardText: ["Monthly salary in USDC", "Station Commuter Ticket NFT"],
    skills: ["writing", "organization"],
    isAcceptingApplications: false,
    links: [],
    bannerURL: "/banners/digest.png",
  },
}

const stationInitiatives = [
  // contributorReview,
  // waitingRoom,
  // newstand,
  // partnership,
  // networkSustainability,
  // community,
  // midnightStation,
  // brandIdentity,
  // stationDigest,
]

export async function seed() {
  let terminal = (await db.terminal.upsert({
    where: { handle: station.handle.toLowerCase() },
    create: {
      ticketAddress: station.ticketAddress,
      handle: station.handle.toLowerCase(),
      data: station.data,
    },
    update: {
      ticketAddress: station.ticketAddress,
      handle: station.handle,
      data: station.data,
    },
  })) as Terminal

  console.log("Station updated:", terminal)

  // for (const name in stationRoles) {
  //   const roleSeed = stationRoles[name]!
  //   const role = await db.role.upsert({
  //     where: {
  //       terminalId_localId: {
  //         terminalId: terminal.id,
  //         localId: roleSeed.localId,
  //       },
  //     },
  //     create: {
  //       terminalId: terminal.id,
  //       localId: roleSeed.localId,
  //       data: roleSeed.data,
  //     },
  //     update: { data: roleSeed.data },
  //   })
  //   console.log(`  ${(role as Role).data?.name} localId: ${roleSeed.localId}`)
  // }

  // for (const name in stationInitiatives) {
  //   const initiativeSeed = stationInitiatives[name]!
  //   const initiative = await db.initiative.upsert({
  //     where: {
  //       terminalId_localId: {
  //         terminalId: terminal.id,
  //         localId: initiativeSeed.localId,
  //       },
  //     },
  //     create: {
  //       terminalId: terminal.id,
  //       localId: initiativeSeed.localId,
  //       data: initiativeSeed.data,
  //     },
  //     update: { data: initiativeSeed.data },
  //   })
  //   console.log(`  ${(initiative as Initiative).data?.name} localId: ${initiative.localId}`)
  // }
}
