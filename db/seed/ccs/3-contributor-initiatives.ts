import db from "../../index"
import { InitiativeMetadata } from "app/initiative/types"
import { terminalId, initiativeIds } from "./0-terminal"

interface ContributorSeed {
  address: string
  initiativeLocalIds: number[]
}

const bhaumik: ContributorSeed = {
  address: "0xc7814D61A8236303a8854fc272cA0419A7e18E32",
  initiativeLocalIds: [initiativeIds.strategy],
}
const melvin: ContributorSeed = {
  address: "0x358a7107fB497d96F406E8D807acC32AEe1d889a",
  initiativeLocalIds: [initiativeIds.workshops],
}
const nick: ContributorSeed = {
  address: "0x8cD48c84FFc642653f34dF82dd7ac9541A4dead9",
  initiativeLocalIds: [initiativeIds.education],
}
const liam: ContributorSeed = {
  address: "0xad9242795ad7fe630adda2b29ed39a4f4c4fd84b",
  initiativeLocalIds: [],
}
const tasha: ContributorSeed = {
  address: "0x0EF7fc7B6730148Af0b35e0754a1420Bad088c4E",
  initiativeLocalIds: [initiativeIds.brand],
}
const courtland: ContributorSeed = {
  address: "0xfa62b9143f6b0d7e125f4e721a613a7313948c75",
  initiativeLocalIds: [initiativeIds.electives],
}
const thomas: ContributorSeed = {
  address: "0x9804C778D23c83ea2c7981f6cf5e3f299AEBEb9e",
  initiativeLocalIds: [initiativeIds.electives],
}
const olly: ContributorSeed = {
  address: "0xB15F50e5AD35F29Bf52601d6629b3De44a3b922e",
  initiativeLocalIds: [initiativeIds.strategy],
}
const kemi: ContributorSeed = {
  address: "0x3865d06B16BF8defC9795881F7a08D12ffbAaB99",
  initiativeLocalIds: [initiativeIds.workshops],
}
const caryn: ContributorSeed = {
  address: "0x7D65B0A423c75e531BE681750514ca73Ff8B1d6A",
  initiativeLocalIds: [initiativeIds.community],
}
const kassen: ContributorSeed = {
  address: "0x90A0233A0c27D15ffA23E293EC8dd6f2Ef2942e2",
  initiativeLocalIds: [initiativeIds.community],
}
const sara: ContributorSeed = {
  address: "0xa139d29Cf66171d83E816D7b1dF768e07c9BC6Ab",
  initiativeLocalIds: [initiativeIds.journal],
}
const aaron: ContributorSeed = {
  address: "0x48ff4d06Ceb0d69C958EE7856A2629Bb568Cffdc",
  initiativeLocalIds: [initiativeIds.education],
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
  for (const accountName in ccsContributors) {
    const contributorSeed = ccsContributors[accountName]! as ContributorSeed

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
