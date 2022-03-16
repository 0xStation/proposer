import { TicketMetadata } from "app/ticket/types"
import db from "../../index"
import { roleIds } from "./0-terminal"

interface ContributorSeed {
  address: string
  joinedAt: Date
  role: number
  data: TicketMetadata
}

const mind: ContributorSeed = {
  address: "0xd32FA3e71737a19eE4CA44334b9f3c52665a6CDB",
  joinedAt: new Date("2021-06-01"),
  role: roleIds.staff,
  data: {
    ticketImageUrl:
      "https://station-images.nyc3.digitaloceanspaces.com/4e846cc6-efe4-4eb0-92ba-de3eff1130ef.png",
  },
}
const tina: ContributorSeed = {
  address: "0x78918036a8e4B9179bEE3CAB57110A3397986E44",
  joinedAt: new Date("2021-06-01"),
  role: roleIds.staff,
  data: {
    ticketImageUrl:
      "https://station-images.nyc3.digitaloceanspaces.com/008e35cf-fa5b-4468-84b5-2e7d224a186b.png",
  },
}
const conner: ContributorSeed = {
  address: "0x016562aA41A8697720ce0943F003141f5dEAe006",
  joinedAt: new Date("2021-08-18"),
  role: roleIds.staff,
  data: {
    ticketImageUrl:
      "https://station-images.nyc3.digitaloceanspaces.com/10df2a76-5335-44d4-baaa-935c2184d716.png",
  },
}
const kristen: ContributorSeed = {
  address: "0xaE55f61f85935BBB68b8809d5c02142e4CbA9a13",
  joinedAt: new Date("2021-12-01"),
  role: roleIds.staff,
  data: {
    ticketImageUrl:
      "https://station-images.nyc3.digitaloceanspaces.com/1e1ba752-33f3-4237-9218-efe14ece09a9.png",
  },
}
const michael: ContributorSeed = {
  address: "0x65A3870F48B5237f27f674Ec42eA1E017E111D63",
  joinedAt: new Date("2021-12-01"),
  role: roleIds.dailyCommuter,
  data: {
    ticketImageUrl:
      "https://station-images.nyc3.digitaloceanspaces.com/3e51202a-cfb1-4994-b7aa-6ebbb06e6a3c.png",
  },
}
const calvin: ContributorSeed = {
  address: "0xB0F0bA31aA582726E36Dc0c79708E9e072455eD2",
  joinedAt: new Date("2021-07-20"),
  role: roleIds.dailyCommuter,
  data: {
    ticketImageUrl:
      "https://station-images.nyc3.digitaloceanspaces.com/c1c48b5d-8892-4cb4-823b-bdd9e32badc6.png",
  },
}
const brendan: ContributorSeed = {
  address: "0x17B7163E708A06De4DdA746266277470dd42C53f",
  joinedAt: new Date("2021-07-25"),
  role: roleIds.dailyCommuter,
  data: {
    ticketImageUrl:
      "https://station-images.nyc3.digitaloceanspaces.com/562cd82c-bf8c-427c-ab35-338b32481e96.png",
  },
}
const abe: ContributorSeed = {
  address: "0x237c9dbB180C4Fbc7A8DBfd2b70A9aab2518A33f",
  joinedAt: new Date("2021-12-15"),
  role: roleIds.dailyCommuter,
  data: {
    ticketImageUrl:
      "https://station-images.nyc3.digitaloceanspaces.com/02d84442-8684-41c9-9805-3f3d0c871ca4.png",
  },
}
const nick: ContributorSeed = {
  address: "0x2f40e3Fb0e892240E3cd5682D10ce1860275174C",
  joinedAt: new Date("2022-01-01"),
  role: roleIds.weekendCommuter,
  data: {
    ticketImageUrl:
      "https://station-images.nyc3.digitaloceanspaces.com/01ae40d0-1d13-489a-8ad4-d3c13493281f.png",
  },
}
const alli: ContributorSeed = {
  address: "0x32447704A3AC5Ed491B6091497ffB67A7733b624",
  joinedAt: new Date("2021-12-30"),
  role: roleIds.dailyCommuter,
  data: {
    ticketImageUrl:
      "https://station-images.nyc3.digitaloceanspaces.com/9e4eb427-c55d-4801-b380-9087bcc65958.png",
  },
}
const kassen: ContributorSeed = {
  address: "0x90A0233A0c27D15ffA23E293EC8dd6f2Ef2942e2",
  joinedAt: new Date("2021-12-30"),
  role: roleIds.dailyCommuter,
  data: {
    ticketImageUrl:
      "https://station-images.nyc3.digitaloceanspaces.com/02d10d38-99a8-4c8b-8556-c381cee9bba0.png",
  },
}
const alex: ContributorSeed = {
  address: "0x69F35Bed06115Dd05AB5452058d9dbe8a7AD80f1",
  joinedAt: new Date("2022-01-01"),
  role: roleIds.weekendCommuter,
  data: {
    ticketImageUrl:
      "https://station-images.nyc3.digitaloceanspaces.com/0364083e-3afa-4bb2-9b65-18ad4a2d5ffd.png",
  },
}
// PAST VISITORS
const katie: ContributorSeed = {
  address: "0x28B4DE9c45AF6cb1A5a46c19909108f2BB74a2BE",
  joinedAt: new Date("2021-11-30"),
  role: roleIds.visitor,
  data: {
    ticketImageUrl: "",
  },
}
const reggie: ContributorSeed = {
  address: "0x06Ac1F9f86520225b73EFCe4982c9d9505753251",
  joinedAt: new Date("2022-01-23"),
  role: roleIds.visitor,
  data: {
    ticketImageUrl: "",
  },
}
const ruby: ContributorSeed = {
  address: "0x87fB7c717A4145095Eb076e239BC0F8Fba42cf49",
  joinedAt: new Date("2021-12-23"),
  role: roleIds.visitor,
  data: {
    ticketImageUrl: "",
  },
}
const jasmine: ContributorSeed = {
  address: "0x29668d39c163f64a1c177c272a8e2D9ecc85F0dE",
  joinedAt: new Date("2021-08-01"),
  role: roleIds.visitor,
  data: {
    ticketImageUrl: "",
  },
}
const stephanie: ContributorSeed = {
  address: "0x6D2c778705D5278eb0f379b067A3B093bCD25f86",
  joinedAt: new Date("2021-09-15"),
  role: roleIds.visitor,
  data: {
    ticketImageUrl: "",
  },
}
const kz: ContributorSeed = {
  address: "0xF22727DFe1E1465d5846246899f5D411ff3965fC",
  joinedAt: new Date("2021-07-25"),
  role: roleIds.visitor,
  data: {
    ticketImageUrl: "",
  },
}
const david: ContributorSeed = {
  address: "0xd56e3E325133EFEd6B1687C88571b8a91e517ab0",
  joinedAt: new Date("2021-08-15"),
  role: roleIds.visitor,
  data: {
    ticketImageUrl: "",
  },
}
const yijia: ContributorSeed = {
  address: "0xa6ab56ECD81095BDd5c23aB09aC7299588790378",
  joinedAt: new Date("2021-08-15"),
  role: roleIds.visitor,
  data: {
    ticketImageUrl: "",
  },
}
const kash: ContributorSeed = {
  address: "0x5716e900249D6c35afA41343a2394C32C1B4E6cB",
  joinedAt: new Date("2021-12-15"),
  role: roleIds.visitor,
  data: {
    ticketImageUrl: "",
  },
}
const akshay: ContributorSeed = {
  address: "0x8FAA5498Ca6fc9A61BA967E07fBc9420aab99E55",
  joinedAt: new Date("2021-12-30"),
  role: roleIds.visitor,
  data: {
    ticketImageUrl: "",
  },
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
        data: contributorSeed.data,
      },
      update: {
        roleLocalId: contributorSeed.role,
        joinedAt: contributorSeed.joinedAt,
        data: contributorSeed.data,
      },
    })

    console.log(
      `Contributor updated: accountId ${accountTerminal.accountId}, role ${accountTerminal.roleLocalId}, joinedAt ${accountTerminal.joinedAt}`
    )
  }
}
