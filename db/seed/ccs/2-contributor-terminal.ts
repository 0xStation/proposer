import db from "../../index"
import { terminalId, roleIds } from "./0-terminal"

interface ContributorSeed {
  address: string
  joinedAt: Date
  role: number
}

const bhaumik: ContributorSeed = {
  address: "0xc7814D61A8236303a8854fc272cA0419A7e18E32",
  joinedAt: new Date("2021-09-01"),
  role: roleIds.staff,
}
const melvin: ContributorSeed = {
  address: "0x358a7107fB497d96F406E8D807acC32AEe1d889a",
  joinedAt: new Date("2022-02-01"),
  role: roleIds.teamLead,
}
const nick: ContributorSeed = {
  address: "0x8cD48c84FFc642653f34dF82dd7ac9541A4dead9",
  joinedAt: new Date("2022-02-01"),
  role: roleIds.teamLead,
}
const liam: ContributorSeed = {
  address: "0xad9242795ad7fe630adda2b29ed39a4f4c4fd84b",
  joinedAt: new Date("2022-02-01"),
  role: roleIds.teamLead,
}
const tasha: ContributorSeed = {
  address: "0x0EF7fc7B6730148Af0b35e0754a1420Bad088c4E",
  joinedAt: new Date("2022-02-01"),
  role: roleIds.teamLead,
}
const courtland: ContributorSeed = {
  address: "0xfa62b9143f6b0d7e125f4e721a613a7313948c75",
  joinedAt: new Date("2022-02-01"),
  role: roleIds.teamLead,
}
const thomas: ContributorSeed = {
  address: "0x9804C778D23c83ea2c7981f6cf5e3f299AEBEb9e",
  joinedAt: new Date("2022-02-01"),
  role: roleIds.teamLead,
}
const olly: ContributorSeed = {
  address: "0xB15F50e5AD35F29Bf52601d6629b3De44a3b922e",
  joinedAt: new Date("2022-02-01"),
  role: roleIds.teamLead,
}
const kemi: ContributorSeed = {
  address: "0x3865d06B16BF8defC9795881F7a08D12ffbAaB99",
  joinedAt: new Date("2022-02-01"),
  role: roleIds.teamLead,
}
const caryn: ContributorSeed = {
  address: "0x7D65B0A423c75e531BE681750514ca73Ff8B1d6A",
  joinedAt: new Date("2022-02-01"),
  role: roleIds.teamLead,
}
const kassen: ContributorSeed = {
  address: "0x90A0233A0c27D15ffA23E293EC8dd6f2Ef2942e2",
  joinedAt: new Date("2022-02-01"),
  role: roleIds.teamLead,
}
const sara: ContributorSeed = {
  address: "0xa139d29Cf66171d83E816D7b1dF768e07c9BC6Ab",
  joinedAt: new Date("2022-02-01"),
  role: roleIds.teamLead,
}
const aaron: ContributorSeed = {
  address: "0x48ff4d06Ceb0d69C958EE7856A2629Bb568Cffdc",
  joinedAt: new Date("2022-02-01"),
  role: roleIds.teamLead,
}

export const ccsContributors = {
  // bhaumik,
  // melvin,
  // nick,
  // liam,
  // tasha,
  // courtland,
  // thomas,
  // olly,
  // kemi,
  // caryn,
  // kassen,
  // sara,
  // aaron,
}

export async function seed() {
  for (const name in ccsContributors) {
    const contributorSeed = ccsContributors[name]! as ContributorSeed

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
