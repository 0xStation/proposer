import db from "../../index"
import { InitiativeMetadata } from "app/initiative/types"
import { initiativeIds } from "./0-terminal"

interface ContributorSeed {
  address: string
  initiativeLocalIds: number[]
}

const mind: ContributorSeed = {
  address: "0xd32FA3e71737a19eE4CA44334b9f3c52665a6CDB",
  initiativeLocalIds: [
    initiativeIds.waitingRoom,
    initiativeIds.brandIdentity,
    initiativeIds.partnership,
  ],
}
const tina: ContributorSeed = {
  address: "0x78918036a8e4B9179bEE3CAB57110A3397986E44",
  initiativeLocalIds: [
    initiativeIds.newstand,
    initiativeIds.partnership,
    initiativeIds.community,
    initiativeIds.networkSustainability,
    initiativeIds.waitingRoom,
  ],
}
const conner: ContributorSeed = {
  address: "0x016562aA41A8697720ce0943F003141f5dEAe006",
  initiativeLocalIds: [initiativeIds.contributorReview, initiativeIds.waitingRoom],
}
const calvin: ContributorSeed = {
  address: "0xB0F0bA31aA582726E36Dc0c79708E9e072455eD2",
  initiativeLocalIds: [initiativeIds.contributorReview, initiativeIds.networkSustainability],
}
const kristen: ContributorSeed = {
  address: "0xaE55f61f85935BBB68b8809d5c02142e4CbA9a13",
  initiativeLocalIds: [
    initiativeIds.contributorReview,
    initiativeIds.waitingRoom,
    initiativeIds.midnightStation,
  ],
}
const brendan: ContributorSeed = {
  address: "0x17B7163E708A06De4DdA746266277470dd42C53f",
  initiativeLocalIds: [initiativeIds.waitingRoom, initiativeIds.midnightStation],
}
const michael: ContributorSeed = {
  address: "0x65A3870F48B5237f27f674Ec42eA1E017E111D63",
  initiativeLocalIds: [initiativeIds.waitingRoom, initiativeIds.midnightStation],
}
const abe: ContributorSeed = {
  address: "0x237c9dbB180C4Fbc7A8DBfd2b70A9aab2518A33f",
  initiativeLocalIds: [initiativeIds.waitingRoom, initiativeIds.midnightStation],
}
const nick: ContributorSeed = {
  address: "0x2f40e3Fb0e892240E3cd5682D10ce1860275174C",
  initiativeLocalIds: [initiativeIds.networkSustainability, initiativeIds.contributorReview],
}
const alli: ContributorSeed = {
  address: "0x32447704A3AC5Ed491B6091497ffB67A7733b624",
  initiativeLocalIds: [initiativeIds.newstand, initiativeIds.stationDigest],
}
const kassen: ContributorSeed = {
  address: "0x90A0233A0c27D15ffA23E293EC8dd6f2Ef2942e2",
  initiativeLocalIds: [initiativeIds.partnership, initiativeIds.community],
}
const alex: ContributorSeed = {
  address: "0x69F35Bed06115Dd05AB5452058d9dbe8a7AD80f1",
  initiativeLocalIds: [initiativeIds.partnership, initiativeIds.stationDigest],
}
const katie: ContributorSeed = {
  address: "0x28B4DE9c45AF6cb1A5a46c19909108f2BB74a2BE",
  initiativeLocalIds: [initiativeIds.newstand],
}
const reggie: ContributorSeed = {
  address: "0x06Ac1F9f86520225b73EFCe4982c9d9505753251",
  initiativeLocalIds: [initiativeIds.newstand],
}
const ruby: ContributorSeed = {
  address: "0x87fB7c717A4145095Eb076e239BC0F8Fba42cf49",
  initiativeLocalIds: [initiativeIds.newstand],
}
const jasmine: ContributorSeed = {
  address: "0x29668d39c163f64a1c177c272a8e2D9ecc85F0dE",
  initiativeLocalIds: [initiativeIds.newstand],
}
const stephanie: ContributorSeed = {
  address: "0x6D2c778705D5278eb0f379b067A3B093bCD25f86",
  initiativeLocalIds: [initiativeIds.brandIdentity],
}

export const stationContributors = {
  //   tina,
  //   mind,
  //   conner,
  //   kristen,
  //   calvin,
  //   brendan,
  //   michael,
  //   abe,
  //   nick,
  //   alli,
  //   kassen,
  //   alex,
  katie,
  reggie,
  ruby,
  jasmine,
  stephanie,
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
