import db from "../../index"

interface ContributorSeed {
  address: string
  joinedAt: Date
  role: number
  initiativeLocalIds: number[]
}

const roleIds = {
  staff: 1,
  dailyCommuter: 2,
  weekendCommuter: 3,
  visitor: 4,
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
  joinedAt: new Date("2021-10-01"),
  role: roleIds.staff,
  initiativeLocalIds: [
    initiaitveIds.waitingRoomId,
    initiaitveIds.brandIdentityId,
    initiaitveIds.partnershipId,
  ],
}
const tina: ContributorSeed = {
  address: "0x78918036a8e4B9179bEE3CAB57110A3397986E44",
  joinedAt: new Date("2021-10-01"),
  role: roleIds.staff,
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
  joinedAt: new Date("2021-10-01"),
  role: roleIds.staff,
  initiativeLocalIds: [initiaitveIds.contributorReviewId, initiaitveIds.waitingRoomId],
}
const calvin: ContributorSeed = {
  address: "0xB0F0bA31aA582726E36Dc0c79708E9e072455eD2",
  joinedAt: new Date("2021-10-01"),
  role: roleIds.dailyCommuter,
  initiativeLocalIds: [initiaitveIds.contributorReviewId, initiaitveIds.networkSustainabilityId],
}
const kristen: ContributorSeed = {
  address: "0xaE55f61f85935BBB68b8809d5c02142e4CbA9a13",
  joinedAt: new Date("2021-12-01"),
  role: roleIds.staff,
  initiativeLocalIds: [
    initiaitveIds.contributorReviewId,
    initiaitveIds.waitingRoomId,
    initiaitveIds.midnightStationId,
  ],
}
const brendan: ContributorSeed = {
  address: "0x17B7163E708A06De4DdA746266277470dd42C53f",
  joinedAt: new Date("2021-11-01"),
  role: roleIds.dailyCommuter,
  initiativeLocalIds: [initiaitveIds.waitingRoomId, initiaitveIds.midnightStationId],
}
const michael: ContributorSeed = {
  address: "0x65A3870F48B5237f27f674Ec42eA1E017E111D63",
  joinedAt: new Date("2021-12-01"),
  role: roleIds.dailyCommuter,
  initiativeLocalIds: [initiaitveIds.waitingRoomId, initiaitveIds.midnightStationId],
}
const abe: ContributorSeed = {
  address: "0x237c9dbB180C4Fbc7A8DBfd2b70A9aab2518A33f",
  joinedAt: new Date("2021-12-15"),
  role: roleIds.dailyCommuter,
  initiativeLocalIds: [initiaitveIds.waitingRoomId, initiaitveIds.midnightStationId],
}
const nick: ContributorSeed = {
  address: "0x2f40e3Fb0e892240E3cd5682D10ce1860275174C",
  joinedAt: new Date("2021-01-01"),
  role: roleIds.weekendCommuter,
  initiativeLocalIds: [initiaitveIds.networkSustainabilityId, initiaitveIds.contributorReviewId],
}
const alli: ContributorSeed = {
  address: "0x32447704A3AC5Ed491B6091497ffB67A7733b624",
  joinedAt: new Date("2021-12-30"),
  role: roleIds.dailyCommuter,
  initiativeLocalIds: [initiaitveIds.newstandId, initiaitveIds.stationDigestId],
}
const kassen: ContributorSeed = {
  address: "0x90A0233A0c27D15ffA23E293EC8dd6f2Ef2942e2",
  joinedAt: new Date("2021-12-30"),
  role: roleIds.dailyCommuter,
  initiativeLocalIds: [initiaitveIds.partnershipId, initiaitveIds.communityId],
}
const alex: ContributorSeed = {
  address: "0x69F35Bed06115Dd05AB5452058d9dbe8a7AD80f1",
  joinedAt: new Date("2021-01-01"),
  role: roleIds.weekendCommuter,
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
  for (const name in stationContributors) {
    const contributorSeed = stationContributors[name]! as ContributorSeed

    console.log(`  ${contributorSeed.address}`)

    const account = await db.account.findUnique({ where: { address: contributorSeed.address } })

    if (!account) {
      console.log(`no account found with name ${name}, address ${contributorSeed.address}`)
      continue
    }

    const accountTerminal = await db.accountTerminal.upsert({
      where: {
        accountId_terminalId: {
          accountId: account?.id,
          terminalId,
        },
      },
      create: {
        accountId: account.id,
        terminalId,
        roleLocalId: contributorSeed.role,
        joinedAt: contributorSeed.joinedAt,
      },
      update: {
        roleLocalId: contributorSeed.role,
        joinedAt: contributorSeed.joinedAt,
      },
    })

    console.log(
      `Contributor updated: accountId ${accountTerminal.accountId}, role ${accountTerminal.roleLocalId}, joinedAt ${accountTerminal.joinedAt}`
    )
  }
}
