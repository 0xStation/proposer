import db from "../index"
import { Initiative, InitiativeMetadata } from "app/initiative/types"
import { Symbol } from "app/types"
import { contributors } from "./contributors"

const contributorDirectoryMetadata: InitiativeMetadata & { localId: number } = {
  localId: 1,
  name: "Contributor Directory",
  description:
    "Station's contributor directory is the cornerstone of Station's reputation system, enabling contributors to recognize one another's work.",
  shortName: "CONTRIBUTOR DIRECTORY",
  isAcceptingApplications: false,
  links: [{ symbol: Symbol.GITHUB, url: "https://github.com/0xStation/protocol-v1" }],
  members: [
    contributors.conner.address,
    contributors.akshay.address,
    contributors.calvin.address,
    contributors.nick.address,
    contributors.kristen.address,
  ],
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
  isAcceptingApplications: true,
  contributeText: [
    "Working on the Internet is hardly something new. While crypto unlocks new primitives for work to be done on the Internet, the exuberant optimism obfuscates the day-to-day conditions, operating details, and human stories behind each contributor.",
    "We're inviting writers, artists, technologists, and researchers across all disciplines to push forward radical imaginations around the future of work unlocked by crypto while critically examine the current state of existence through a human lens.",
    "We are a decentralized media publication where every contributor will have ownership over the work they create while sharing the upside from the piece fairly.",
  ],
  links: [{ symbol: Symbol.MIRROR, url: "https://station.mirror.xyz/" }],
  rewardText: "800 USDC, Station Visitor Ticket NFT",
  bannerURL: "/public/newstand-banner.png",
  members: [contributors.tina.address, contributors.mind.address, contributors.alli.address],
}
const partnershipMetadata: InitiativeMetadata & { localId: number } = {
  localId: 4,
  name: "Partnerships",
  description: "Forming GTM plans to onboard our Beta Terminal partners.",
  shortName: "PARTNERSHIP",
  isAcceptingApplications: true,
  links: [],
  members: [
    contributors.tina.address,
    contributors.alli.address,
    contributors.kassen.address,
    contributors.alex.address,
  ],
}

const stationInitiaitves = [
  contributorDirectoryMetadata,
  waitingRoomMetadata,
  newstandMetadata,
  partnershipMetadata,
]

export async function seedInitiatives(terminals) {
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
  }
}
