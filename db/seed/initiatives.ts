import db from "../index"
import { Initiative, InitiativeMetadata } from "app/initiative/types"
import { Symbol } from "app/types"
import { contributors } from "./contributors"

const contributorReviewMetadata: InitiativeMetadata & { localId: number } = {
  localId: 1,
  name: "Contributor Review",
  oneLiner: "Peer-to-peer recognition that publicizes your proof of contribution.",
  description:
    "Station's contributor review is the cornerstone of Station's reputation system, enabling contributors to recognize one another's work.",
  shortName: "CONTRIBUTOR REVIEW",
  isAcceptingApplications: false,
  links: [{ symbol: Symbol.GITHUB, url: "https://github.com/0xStation/protocol-v1" }],
  members: [contributors.conner.address, contributors.calvin.address, contributors.kristen.address],
}
const waitingRoomMetadata: InitiativeMetadata & { localId: number } = {
  localId: 2,
  name: "Waiting Room",
  description:
    "Station's waiting room is the onboarding experience used by DAOs to recruit new members.",
  shortName: "WAITING ROOM",
  isAcceptingApplications: false,
  links: [{ symbol: Symbol.GITHUB, url: "https://github.com/0xStation/web" }],
  members: [
    contributors.mind.address,
    contributors.kristen.address,
    contributors.michael.address,
    contributors.abe.address,
    contributors.conner.address,
  ],
}
const newstandMetadata: InitiativeMetadata & { localId: number } = {
  localId: 3,
  name: "Newstand",
  description:
    "Station Network’s publication focused on exploring the possibilities of work in an era of hyper connectivity and fluidity.",
  shortName: "NEWSTAND",
  oneLiner:
    "Newstand is Station Network’s publication focused on exploring the possibilities of work in an era of hyper connectivity and fluidity.",
  isAcceptingApplications: true,
  contributeText: [
    "Working on the Internet is hardly something new. While crypto unlocks new primitives for work to be done on the Internet, the exuberant optimism obfuscates the day-to-day conditions, operating details, and human stories behind each contributor.",
    "We're inviting writers, artists, technologists, and researchers across all disciplines to push forward radical imaginations around the future of work unlocked by crypto while critically examine the current state of existence through a human lens.",
    "We are a decentralized media publication where every contributor will have ownership over the work they create while sharing the upside from the piece fairly.",
  ],
  links: [{ symbol: Symbol.MIRROR, url: "https://station.mirror.xyz/" }],
  rewardText: ["800 USDC", "Station Visitor Ticket NFT"],
  bannerURL: "/public/newstand-banner.png",
  members: [contributors.tina.address, contributors.mind.address, contributors.alli.address],
  commitment: "Part-time (7-10 hrs/week)",
  skills: ["Writing", "Journalism Editing"],
}

const partnershipMetadata: InitiativeMetadata & { localId: number } = {
  localId: 4,
  name: "Partnerships",
  oneLiner: "Inviting the best DAOs to mobilize contributors on Station.",
  description: "Forming GTM plans to onboard our Beta Terminal partners.",
  shortName: "PARTNERSHIP",
  isAcceptingApplications: false,
  links: [],
  members: [
    contributors.tina.address,
    contributors.alli.address,
    contributors.kassen.address,
    contributors.alex.address,
  ],
}

const networkSustainability: InitiativeMetadata & { localId: number } = {
  localId: 5,
  name: "Network Sustainability",
  oneLiner:
    "Network Sustainability is an initiative focused on designing a sustainable economic engine for the Station Network.",
  description:
    "Network Sustainability is an initiative focused on designing a sustainable economic engine for the Station Network.",
  shortName: "NETWORK SUSTAINABILITY",
  isAcceptingApplications: false,
  links: [],
  members: [contributors.calvin.address, contributors.nick.address],
}

const contributorExperience: InitiativeMetadata & { localId: number } = {
  localId: 6,
  name: "Contributor Experience",
  oneLiner:
    "Contributor Experience is an initiative to make new contributors feel welcomed, existing contributors feel recognized and belonged, and graduated contributors feel proud that they’ve been part of the ride. ",
  description:
    "Contributor Experience is an initiative to make new contributors feel welcomed, existing contributors feel recognized and belonged, and graduated contributors feel proud that they’ve been part of the ride. ",
  shortName: "CONTRIBUTOR EXPERIENCE",
  isAcceptingApplications: false,
  links: [],
  members: [contributors.kassen.address, contributors.tina.address],
}

const midnightStation: InitiativeMetadata & { localId: number } = {
  localId: 7,
  name: "Midnight Station",
  oneLiner: "",
  description: "",
  shortName: "MIDNIGHT STATION",
  isAcceptingApplications: false,
  links: [],
  members: [
    contributors.brendan.address,
    contributors.kristen.address,
    contributors.abe.address,
    contributors.michael.address,
  ],
}

const brandIdentity: InitiativeMetadata & { localId: number } = {
  localId: 8,
  name: "Brand Identity",
  oneLiner: "",
  description: "",
  shortName: "BRAND IDENTITY",
  isAcceptingApplications: false,
  links: [],
  members: [contributors.mind.address],
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
]

export async function seedInitiatives(terminals) {
  for (const name in stationInitiaitves) {
    const initiative = stationInitiaitves[name]
    const ret = await db.initiative.upsert({
      where: {
        terminalInitiative: {
          terminalTicket: terminals.Station.ticketAddress,
          localId: initiative!.localId,
        },
      },
      create: {
        terminalTicket: terminals.Station.ticketAddress,
        terminalId: terminals.Station.id,
        localId: initiative!.localId,
        data: initiative,
      },
      update: { data: initiative },
    })
    console.log(`  ${(ret as Initiative).data?.name} localId: ${ret.localId}`)
  }
}
