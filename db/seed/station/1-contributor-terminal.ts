import db from "../../index"
import { roleIds } from "./0-terminal"

interface ContributorSeed {
  address: string
  joinedAt: Date
  role: number
}

const mind: ContributorSeed = {
  address: "0xd32FA3e71737a19eE4CA44334b9f3c52665a6CDB",
  joinedAt: new Date("2021-05-01"),
  role: roleIds.staff,
}
const tina: ContributorSeed = {
  address: "0x78918036a8e4B9179bEE3CAB57110A3397986E44",
  joinedAt: new Date("2021-05-01"),
  role: roleIds.staff,
}
const conner: ContributorSeed = {
  address: "0x016562aA41A8697720ce0943F003141f5dEAe006",
  joinedAt: new Date("2021-08-18"),
  role: roleIds.staff,
}
const kristen: ContributorSeed = {
  address: "0xaE55f61f85935BBB68b8809d5c02142e4CbA9a13",
  joinedAt: new Date("2021-12-01"),
  role: roleIds.staff,
}
const michael: ContributorSeed = {
  address: "0x65A3870F48B5237f27f674Ec42eA1E017E111D63",
  joinedAt: new Date("2021-12-01"),
  role: roleIds.dailyCommuter,
}
const calvin: ContributorSeed = {
  address: "0xB0F0bA31aA582726E36Dc0c79708E9e072455eD2",
  joinedAt: new Date("2021-07-20"),
  role: roleIds.dailyCommuter,
}
const brendan: ContributorSeed = {
  address: "0x17B7163E708A06De4DdA746266277470dd42C53f",
  joinedAt: new Date("2021-07-25"),
  role: roleIds.dailyCommuter,
}
const abe: ContributorSeed = {
  address: "0x237c9dbB180C4Fbc7A8DBfd2b70A9aab2518A33f",
  joinedAt: new Date("2021-12-15"),
  role: roleIds.dailyCommuter,
}
const nick: ContributorSeed = {
  address: "0x2f40e3Fb0e892240E3cd5682D10ce1860275174C",
  joinedAt: new Date("2022-01-01"),
  role: roleIds.weekendCommuter,
}
const alli: ContributorSeed = {
  address: "0x32447704A3AC5Ed491B6091497ffB67A7733b624",
  joinedAt: new Date("2021-12-30"),
  role: roleIds.dailyCommuter,
}
const kassen: ContributorSeed = {
  address: "0x90A0233A0c27D15ffA23E293EC8dd6f2Ef2942e2",
  joinedAt: new Date("2021-12-30"),
  role: roleIds.dailyCommuter,
}
const alex: ContributorSeed = {
  address: "0x69F35Bed06115Dd05AB5452058d9dbe8a7AD80f1",
  joinedAt: new Date("2022-01-01"),
  role: roleIds.weekendCommuter,
}
// PAST VISITORS
const katie: ContributorSeed = {
  address: "0x28B4DE9c45AF6cb1A5a46c19909108f2BB74a2BE",
  joinedAt: new Date("2021-11-30"),
  role: roleIds.visitor,
}
const reggie: ContributorSeed = {
  address: "0x06Ac1F9f86520225b73EFCe4982c9d9505753251",
  joinedAt: new Date("2022-01-23"),
  role: roleIds.visitor,
}
const ruby: ContributorSeed = {
  address: "0x87fB7c717A4145095Eb076e239BC0F8Fba42cf49",
  joinedAt: new Date("2021-12-23"),
  role: roleIds.visitor,
}
const jasmine: ContributorSeed = {
  address: "0x29668d39c163f64a1c177c272a8e2D9ecc85F0dE",
  joinedAt: new Date("2021-08-01"),
  role: roleIds.visitor,
}
const stephanie: ContributorSeed = {
  address: "0x6D2c778705D5278eb0f379b067A3B093bCD25f86",
  joinedAt: new Date("2021-09-15"),
  role: roleIds.visitor,
}
const kz: ContributorSeed = {
  address: "0xF22727DFe1E1465d5846246899f5D411ff3965fC",
  joinedAt: new Date("2021-07-25"),
  role: roleIds.visitor,
}
const david: ContributorSeed = {
  address: "0xd56e3E325133EFEd6B1687C88571b8a91e517ab0",
  joinedAt: new Date("2021-08-15"),
  role: roleIds.visitor,
}
const yijia: ContributorSeed = {
  address: "0xa6ab56ECD81095BDd5c23aB09aC7299588790378",
  joinedAt: new Date("2021-08-15"),
  role: roleIds.visitor,
}
const kash: ContributorSeed = {
  address: "0x5716e900249D6c35afA41343a2394C32C1B4E6cB",
  joinedAt: new Date("2021-12-15"),
  role: roleIds.visitor,
}
const akshay: ContributorSeed = {
  address: "0x8FAA5498Ca6fc9A61BA967E07fBc9420aab99E55",
  joinedAt: new Date("2021-12-30"),
  role: roleIds.visitor,
}

export const stationContributors = {
  // tina,
  // mind,
  // conner,
  // kristen,
  // michael,
  // calvin,
  // brendan,
  // abe,
  // alli,
  // kassen,
  // nick,
  // alex,
  // katie,
  // reggie,
  // ruby,
  // jasmine,
  // stephanie,
  // kz,
  // david,
  // yijia,
  // kash,
  // akshay,
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
