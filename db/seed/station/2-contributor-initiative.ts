import db from "../../index"
import { Initiative, InitiativeMetadata } from "app/initiative/types"

interface ContributorSeed {
  address: string
  initiativeLocalIds: number[]
}

const initiaitveIds = {
  contributorReviewId: 1,
  waitingRoomId: 2,
  newstandId: 3,
  partnershipId: 4,
  networkSustainabilityId: 5,
  communityId: 6,
  midnightStationId: 7,
  brandIdentityId: 8,
  stationDigestId: 9,
}

const mind: ContributorSeed = {
  address: "0xd32FA3e71737a19eE4CA44334b9f3c52665a6CDB",
  initiativeLocalIds: [
    initiaitveIds.waitingRoomId,
    initiaitveIds.brandIdentityId,
    initiaitveIds.partnershipId,
  ],
}
const tina: ContributorSeed = {
  address: "0x78918036a8e4B9179bEE3CAB57110A3397986E44",
  initiativeLocalIds: [
    initiaitveIds.newstandId,
    initiaitveIds.partnershipId,
    initiaitveIds.communityId,
    initiaitveIds.networkSustainabilityId,
    initiaitveIds.waitingRoomId,
  ],
}
const conner: ContributorSeed = {
  address: "0x016562aA41A8697720ce0943F003141f5dEAe006",
  initiativeLocalIds: [initiaitveIds.contributorReviewId, initiaitveIds.waitingRoomId],
}
const calvin: ContributorSeed = {
  address: "0xB0F0bA31aA582726E36Dc0c79708E9e072455eD2",
  initiativeLocalIds: [initiaitveIds.contributorReviewId, initiaitveIds.networkSustainabilityId],
}
const kristen: ContributorSeed = {
  address: "0xaE55f61f85935BBB68b8809d5c02142e4CbA9a13",
  initiativeLocalIds: [
    initiaitveIds.contributorReviewId,
    initiaitveIds.waitingRoomId,
    initiaitveIds.midnightStationId,
  ],
}
const brendan: ContributorSeed = {
  address: "0x17B7163E708A06De4DdA746266277470dd42C53f",
  initiativeLocalIds: [initiaitveIds.waitingRoomId, initiaitveIds.midnightStationId],
}
const michael: ContributorSeed = {
  address: "0x65A3870F48B5237f27f674Ec42eA1E017E111D63",
  initiativeLocalIds: [initiaitveIds.waitingRoomId, initiaitveIds.midnightStationId],
}
const abe: ContributorSeed = {
  address: "0x237c9dbB180C4Fbc7A8DBfd2b70A9aab2518A33f",
  initiativeLocalIds: [initiaitveIds.waitingRoomId, initiaitveIds.midnightStationId],
}
const nick: ContributorSeed = {
  address: "0x2f40e3Fb0e892240E3cd5682D10ce1860275174C",
  initiativeLocalIds: [initiaitveIds.networkSustainabilityId, initiaitveIds.contributorReviewId],
}
const alli: ContributorSeed = {
  address: "0x32447704A3AC5Ed491B6091497ffB67A7733b624",
  initiativeLocalIds: [initiaitveIds.newstandId, initiaitveIds.stationDigestId],
}
const kassen: ContributorSeed = {
  address: "0x90A0233A0c27D15ffA23E293EC8dd6f2Ef2942e2",
  initiativeLocalIds: [initiaitveIds.partnershipId, initiaitveIds.communityId],
}
const alex: ContributorSeed = {
  address: "0x69F35Bed06115Dd05AB5452058d9dbe8a7AD80f1",
  initiativeLocalIds: [initiaitveIds.partnershipId, initiaitveIds.stationDigestId],
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
}

export async function seed() {
  const terminalId = 1
  for (const accountName in stationContributors) {
    const contributorSeed = stationContributors[accountName]! as ContributorSeed

    console.log(`${contributorSeed.address}`)

    const account = await db.account.findUnique({ where: { address: contributorSeed.address } })

    if (!account) {
      console.log(`no account found with name ${accountName}, address ${contributorSeed.address}`)
      continue
    }

    for (const i in contributorSeed.initiativeLocalIds) {
      const localId = contributorSeed.initiativeLocalIds[i] as number
      const initiative = await db.initiative.findUnique({
        where: {
          terminalId_localId: {
            terminalId,
            localId,
          },
        },
      })

      if (!initiative) {
        console.log(`could not find localId of ${localId}`)
        continue
      }

      const accountInitiative = await db.accountInitiative.upsert({
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

      console.log(
        `contributor ${contributorSeed.address}, initiative ${
          (initiative.data as InitiativeMetadata)?.name
        }, status ${accountInitiative.status}`
      )
    }
  }
}
