import db from "../index"
import { Account, AccountMetadata } from "app/account/types"
import { Initiative } from "app/initiative/types"

interface AccountSeed {
  address: string
  role: number
  active: boolean
  joinedAt: Date
  initiatives: number[]
}

const initiaitveIds = {
  contributorReviewId: 1,
  waitingRoomId: 2,
  newstandId: 3,
  partnershipId: 4,
  networkSustainabilityId: 5,
  contributorExperienceId: 6,
  midnightStationId: 7,
  brandIdentityId: 8,
  stationDigestId: 9,
}

const roleIds = {
  staff: 1,
  dailyCommuter: 2,
  weekendCommuter: 3,
  visitor: 4,
}

const mind: AccountMetadata & AccountSeed = {
  address: "0xd32FA3e71737a19eE4CA44334b9f3c52665a6CDB",
  role: roleIds.staff,
  active: true,
  joinedAt: new Date("2021-10-01"),
  name: "paprika",
  ticketId: 2, // TODO: remove this when subgraph is ready
  pronouns: "she/her",
  skills: [],
  discordId: "paprika#0027",
  verified: true,
  timezone: "EST",
  ens: "spicypaprika.eth",
  twitterURL: "https://twitter.com/mindapi_",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036023-44570a89-315b-42cb-8a97-fc48c60f1e7a.png",
  initiatives: [
    initiaitveIds.waitingRoomId,
    initiaitveIds.brandIdentityId,
    initiaitveIds.partnershipId,
  ],
}
const tina: AccountMetadata & AccountSeed = {
  address: "0x78918036a8e4B9179bEE3CAB57110A3397986E44",
  role: roleIds.staff,
  active: true,
  joinedAt: new Date("2021-10-01"),
  name: "fakepixels",
  ticketId: 3, // TODO: remove this when subgraph is ready
  pronouns: "she/her",
  skills: [],
  discordId: "fakepixels#6258",
  verified: true,
  timezone: "EST",
  ens: "fkpixels.eth",
  twitterURL: "https://twitter.com/fkpxls",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036016-db43df6c-e240-4f63-aaff-6843d278a2ba.png",
  initiatives: [
    initiaitveIds.newstandId,
    initiaitveIds.partnershipId,
    initiaitveIds.contributorExperienceId,
    initiaitveIds.networkSustainabilityId,
    initiaitveIds.waitingRoomId,
  ],
}
const conner: AccountMetadata & AccountSeed = {
  address: "0x016562aA41A8697720ce0943F003141f5dEAe006",
  role: roleIds.staff,
  active: true,
  joinedAt: new Date("2021-10-01"),
  name: "symmetry",
  ticketId: 0, // TODO: remove this when subgraph is ready
  pronouns: "he/him",
  skills: [],
  discordId: "symmtry#0069",
  verified: true,
  timezone: "EST",
  ens: "symmtry.eth",
  twitterURL: "https://twitter.com/symmtry69",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036030-3c4f0d7b-0946-4ccc-b03b-03fb6e57328e.png",
  initiatives: [initiaitveIds.contributorReviewId, initiaitveIds.waitingRoomId],
}
const calvin: AccountMetadata & AccountSeed = {
  address: "0xB0F0bA31aA582726E36Dc0c79708E9e072455eD2",
  role: roleIds.dailyCommuter,
  active: true,
  joinedAt: new Date("2021-10-01"),
  name: "cc2",
  ticketId: 6, // TODO: remove this when subgraph is ready
  pronouns: "he/him",
  skills: [],
  discordId: "cc2#2803",
  verified: true,
  timezone: "EST",
  // ens: "",
  twitterURL: "https://twitter.com/cchengasaurus",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036007-6e11bb26-6edd-4c9b-9c1c-aa1814e36f11.png",
  initiatives: [initiaitveIds.contributorReviewId, initiaitveIds.networkSustainabilityId],
}
const kristen: AccountMetadata & AccountSeed = {
  address: "0xaE55f61f85935BBB68b8809d5c02142e4CbA9a13",
  role: roleIds.staff,
  active: true,
  joinedAt: new Date("2021-12-01"),
  name: "rie",
  ticketId: 7, // TODO: remove this when subgraph is ready
  pronouns: "she/her",
  skills: [],
  discordId: "rie#9502",
  verified: true,
  timezone: "EST",
  ens: "rielity.eth",
  twitterURL: "https://twitter.com/0xRie_",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036026-9e4d09b3-8d1b-4261-8a2c-e121146f7d63.png",
  initiatives: [
    initiaitveIds.contributorReviewId,
    initiaitveIds.waitingRoomId,
    initiaitveIds.midnightStationId,
  ],
}
const brendan: AccountMetadata & AccountSeed = {
  address: "0x17B7163E708A06De4DdA746266277470dd42C53f",
  role: roleIds.dailyCommuter,
  active: true,
  joinedAt: new Date("2021-11-01"),
  name: "brendo",
  ticketId: 4, // TODO: remove this when subgraph is ready
  pronouns: "he/him",
  skills: [],
  discordId: "brendo#9038",
  verified: true,
  timezone: "EST",
  ens: "brendo.eth",
  twitterURL: "https://twitter.com/brendanelliot_",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036006-018105d4-e8d4-4fb7-bc82-997351d38d2d.png",
  initiatives: [initiaitveIds.waitingRoomId, initiaitveIds.midnightStationId],
}
const michael: AccountMetadata & AccountSeed = {
  address: "0x65A3870F48B5237f27f674Ec42eA1E017E111D63",
  role: roleIds.dailyCommuter,
  active: true,
  joinedAt: new Date("2021-12-01"),
  name: "frog",
  ticketId: 1, // TODO: remove this when subgraph is ready
  pronouns: "he/him",
  skills: [],
  discordId: "frog#3881",
  verified: true,
  timezone: "EST",
  ens: "0xmcg.eth",
  twitterURL: "https://twitter.com/0xmcg",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036018-25f65c4d-a968-4c6c-b328-15958acdb649.png",
  initiatives: [initiaitveIds.waitingRoomId, initiaitveIds.midnightStationId],
}
const abe: AccountMetadata & AccountSeed = {
  address: "0x237c9dbB180C4Fbc7A8DBfd2b70A9aab2518A33f",
  role: roleIds.dailyCommuter,
  joinedAt: new Date("2021-12-15"),
  active: true,
  name: "cryptoabe",
  ticketId: 12, // TODO: remove this when subgraph is ready
  pronouns: "he/him",
  skills: [],
  discordId: "cryptoabe#3656",
  verified: true,
  timezone: "EST",
  // ens: "",
  twitterURL: "https://twitter.com/abenazer_mekete",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036010-b47feac0-99c5-43a6-963d-89a89aa47ff7.png",
  initiatives: [initiaitveIds.waitingRoomId, initiaitveIds.midnightStationId],
}
const nick: AccountMetadata & AccountSeed = {
  address: "0x2f40e3Fb0e892240E3cd5682D10ce1860275174C",
  role: roleIds.weekendCommuter,
  active: true,
  joinedAt: new Date("2021-01-01"),
  name: "zy2",
  ticketId: 13, // TODO: remove this when subgraph is ready
  pronouns: "he/him",
  skills: [],
  discordId: "zy2#2240",
  verified: true,
  timezone: "EST",
  ens: "zy22yz.eth",
  twitterURL: "https://twitter.com/zy22yz",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036033-abee8f5d-544a-491f-b442-67d4b90639b1.png",
  initiatives: [initiaitveIds.networkSustainabilityId, initiaitveIds.contributorReviewId],
}
const alli: AccountMetadata & AccountSeed = {
  address: "0x32447704a3ac5ed491b6091497ffb67a7733b624",
  role: roleIds.dailyCommuter,
  active: true,
  joinedAt: new Date("2021-12-30"),
  name: "alli",
  ticketId: 10, // TODO: remove this when subgraph is ready
  pronouns: "she/her",
  skills: [],
  discordId: "alli#3226",
  verified: true,
  timezone: "EST",
  ens: "sonofalli.eth",
  twitterURL: "https://twitter.com/sonofalli",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036002-396279ab-0f10-4c61-b2dc-23dea07236f9.png",
  initiatives: [initiaitveIds.newstandId, initiaitveIds.stationDigestId],
}
const kassen: AccountMetadata & AccountSeed = {
  address: "0x90A0233A0c27D15ffA23E293EC8dd6f2Ef2942e2",
  role: roleIds.dailyCommuter,
  active: true,
  joinedAt: new Date("2021-12-30"),
  name: "kassen",
  ticketId: 11, // TODO: remove this when subgraph is ready
  pronouns: "she/her",
  skills: [],
  discordId: "kass#7081",
  verified: true,
  timezone: "EST",
  ens: "kassen.eth",
  twitterURL: "https://twitter.com/kassenq",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036021-6bb5fde3-aef3-4a76-a543-3036c99b8ad0.png",
  initiatives: [initiaitveIds.partnershipId, initiaitveIds.contributorExperienceId],
}
const alex: AccountMetadata & AccountSeed = {
  address: "0x69F35Bed06115Dd05AB5452058d9dbe8a7AD80f1",
  role: roleIds.weekendCommuter,
  active: true,
  joinedAt: new Date("2021-01-01"),
  name: "ahs",
  ticketId: 14, // TODO: remove this when subgraph is ready
  pronouns: "he/him",
  skills: [],
  discordId: "ahs#6679",
  verified: true,
  timezone: "EST",
  // ens: "",
  twitterURL: "https://twitter.com/alexhughsam",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152035995-3aabcfcc-8fee-4d5c-9c37-17b7f51cfcfd.png",
  initiatives: [initiaitveIds.partnershipId, initiaitveIds.stationDigestId],
}
const akshay: AccountMetadata & AccountSeed = {
  address: "0x8FAA5498Ca6fc9A61BA967E07fBc9420aab99E55",
  role: roleIds.visitor,
  joinedAt: new Date("2021-12-15"),
  active: false,
  name: "wagmiking",
  ticketId: 9, // TODO: remove this when subgraph is ready
  pronouns: "he/him",
  skills: [],
  discordId: "wagmiking#0978",
  verified: true,
  timezone: "EST",
  // ens: "",
  twitterURL: "https://twitter.com/wagmiking",
  pfpURL:
    "https://user-images.githubusercontent.com/38736612/152036031-7d5b3fd2-69b7-42f1-8aca-23fece63fc91.png",
  initiatives: [initiaitveIds.waitingRoomId],
}

export const stationContributors = {
  tina,
  mind,
  conner,
  kristen,
  calvin,
  brendan,
  michael,
  abe,
  nick,
  alli,
  kassen,
  alex,
  akshay,
}

export async function seedContributors(terminals) {
  for (const name in stationContributors) {
    const contributorData = stationContributors[name] as AccountMetadata & AccountSeed

    console.log(`  ${contributorData.name.toUpperCase()}`)

    const account = await db.account.upsert({
      where: { address: contributorData!.address },
      create: {
        address: contributorData!.address,
        data: contributorData as AccountMetadata,
      },
      update: {
        data: contributorData as AccountMetadata,
      },
    })

    const ticket = await db.accountTerminal.upsert({
      where: {
        accountId_terminalId: {
          accountId: account.id,
          terminalId: terminals.station.id,
        },
      },
      create: {
        accountId: account.id,
        terminalId: terminals.station.id,
        roleLocalId: contributorData.role,
        joinedAt: contributorData.joinedAt,
        active: contributorData.active,
      },
      update: {
        roleLocalId: contributorData.role,
        joinedAt: contributorData.joinedAt,
        active: contributorData.active,
      },
    })

    console.log(`      Station role: ${ticket.roleLocalId}`)

    for (const name in contributorData.initiatives) {
      const localId = contributorData.initiatives[name] as number
      const initiative = await db.initiative.findUnique({
        where: {
          terminalInitiative: {
            localId,
            terminalTicket: terminals.station.ticketAddress,
          },
        },
      })

      if (!initiative) {
        console.log(`could not find localId of ${localId}`)
        continue
      }

      const membership = await db.accountInitiative.upsert({
        where: {
          accountId_initiativeId: {
            accountId: account.id,
            initiativeId: initiative.id,
          },
        },
        create: {
          accountId: account.id,
          initiativeId: initiative.id,
          status: "CONTRIBUTOR",
        },
        update: {
          status: "CONTRIBUTOR",
        },
      })

      console.log(`      contributor to: ${(initiative as Initiative).data?.name}`)
    }
  }
}
