import db from "./index"
import { TerminalMetadata } from "app/terminal/types"
import { InitiativeMetadata } from "app/initiative/types"
import { AccountMetadata } from "app/account/types"
import { Symbol } from "app/types"

const contributors: (AccountMetadata & { address: string })[] = [
  {
    address: "0x65A3870F48B5237f27f674Ec42eA1E017E111D63",
    name: "michael",
    handle: "0xmcg",
    pronouns: "he/him",
    skills: [],
    discord: "frog#",
    verified: true,
  },
  {
    address: "0xd32FA3e71737a19eE4CA44334b9f3c52665a6CDB",
    name: "mind",
    handle: "mindapi",
    pronouns: "she/her",
    skills: [],
    discord: "mindapi#",
    verified: true,
  },
  {
    name: "tina",
    handle: "fakepixels",
    address: "0x78918036a8e4B9179bEE3CAB57110A3397986E44",
    pronouns: "she/her",
    skills: [],
    discord: "fakepixels#",
    verified: true,
  },
  {
    name: "brendan",
    handle: "brendo",
    address: "0x17B7163E708A06De4DdA746266277470dd42C53f",
    pronouns: "he/him",
    skills: [],
    discord: "#",
    verified: true,
  },
  {
    name: "darian",
    handle: "WGMIApe",
    address: "0x6Cf61c97674C65c68D1E816eCCf36061aCD9a65c",
    pronouns: "he/him",
    skills: [],
    discord: "WGMIape#",
    verified: true,
  },
  {
    name: "calvin",
    handle: "cchengasaurus",
    address: "0xB0F0bA31aA582726E36Dc0c79708E9e072455eD2",
    pronouns: "he/him",
    skills: [],
    discord: "cc2#",
    verified: true,
  },
  {
    name: "kristen",
    handle: "rie",
    address: "0xaE55f61f85935BBB68b8809d5c02142e4CbA9a13",
    pronouns: "she/her",
    skills: [],
    discord: "rie#",
    verified: true,
  },
  {
    name: "conner",
    handle: "symmtry",
    address: "0x016562aA41A8697720ce0943F003141f5dEAe006",
    pronouns: "he/him",
    skills: [],
    discord: "symmtry#",
    verified: true,
  },
  {
    name: "akshay",
    handle: "wagmiking",
    address: "0x8FAA5498Ca6fc9A61BA967E07fBc9420aab99E55",
    pronouns: "he/him",
    skills: [],
    discord: "wagmiking#",
    verified: true,
  },
]

/*
 * This seed function is executed when you run `blitz db seed`.
 */
const seed = async () => {
  // Station terminal
  const stationMetadata: TerminalMetadata = {
    name: "Station",
    handle: "station",
    description: "Building the infrastructure to empower the next billion contributors in web3.",
  }
  let station = await db.terminal.create({
    data: {
      ticketAddress: "0xd9243de6be84EA0f592D20e3E6bd67949D96bfe9",
      data: stationMetadata,
    },
  })

  // Station contributors
  for (let i = 0; i < contributors.length; i++) {
    let contributorData = contributors[i]
    if (contributorData) {
      await db.account.create({
        data: {
          address: contributorData.address,
          data: {
            contributorData,
          },
        },
      })
    }
  }

  // Station initiatives
  const protocolMetadata: InitiativeMetadata = {
    name: "Protocol v1",
    description:
      "Station's protocol is the smart contract engine that powers all of our app's on-chain capabilities.",
    shortName: "PROTOCOl",
    isAcceptingApplications: false,
    links: [{ symbol: Symbol.GITHUB, url: "https://github.com/0xStation/protocol-v1" }],
  }
  const webMetadata: InitiativeMetadata = {
    name: "Web v1",
    description: "Station's web application is the home of our user experience.",
    shortName: "WEB",
    isAcceptingApplications: false,
    links: [{ symbol: Symbol.GITHUB, url: "https://github.com/0xStation/station-web" }],
  }
  const newstandMetadata: InitiativeMetadata = {
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
  }
  const partnershipMetadata: InitiativeMetadata = {
    name: "Terminal Partnership",
    description: "Forming GTM plans to onboard our Beta Terminal partners.",
    shortName: "PARTNERSHIP",
    isAcceptingApplications: true,
    links: [],
  }
  await db.initiative.createMany({
    data: [
      {
        terminalId: station.id,
        data: protocolMetadata,
      },
      {
        terminalId: station.id,
        data: webMetadata,
      },
      {
        terminalId: station.id,
        data: newstandMetadata,
      },
      {
        terminalId: station.id,
        data: partnershipMetadata,
      },
    ],
  })
}

export default seed
