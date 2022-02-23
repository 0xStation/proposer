import { AccountMetadata } from "app/account/types"
import db from "../../index"
import { terminalId, roleIds } from "./0-terminal"

interface ContributorSeed {
  address: string
  data: AccountMetadata
  skills: string[]
}

const bhaumik: ContributorSeed = {
  address: "0xc7814D61A8236303a8854fc272cA0419A7e18E32",
  data: {
    name: "Bhaumik Patel",
    ens: "bhaumik27.eth",
    pfpURL:
      "https://station-images.nyc3.digitaloceanspaces.com/38a9e897-3a62-4b1d-9b25-09a929363a85",
    discordId: "bhaumik#5571",
    timezone: "-05:00",
    verified: true,
  },
  skills: ["partnerships", "recruiting", "project management", "governance", "communications"],
}
const melvin: ContributorSeed = {
  address: "0x358a7107fB497d96F406E8D807acC32AEe1d889a",
  data: {
    name: "Melvin Salvador",
    ens: "",
    pfpURL: "https://station-images.nyc3.digitaloceanspaces.com/ccs-melvin-salvador.jpeg",
    discordId: "melvinsalvador#0668",
    timezone: "-05:00",
    verified: true,
  },
  skills: ["events", "curricula design"],
}
const nick: ContributorSeed = {
  address: "0x8cD48c84FFc642653f34dF82dd7ac9541A4dead9",
  data: {
    name: "Nick Ducoff",
    ens: "stoic.eth",
    pfpURL: "https://station-images.nyc3.digitaloceanspaces.com/ccs-nick-ducoff.jpeg",
    discordId: "stoic#1000",
    timezone: "-05:00",
    verified: true,
  },
  skills: ["partnerships", "events", "marketing", "curricula design"],
}
const liam: ContributorSeed = {
  address: "0xad9242795ad7fe630adda2b29ed39a4f4c4fd84b",
  data: {
    name: "Liam Herbst",
    ens: "herbst.eth",
    pfpURL: "https://station-images.nyc3.digitaloceanspaces.com/ccs-liam-herbst.jpeg",
    discordId: "liamherbst_#2837",
    timezone: "-05:00",
    verified: true,
  },
  skills: ["tokenomics", "accounting"],
}
const tasha: ContributorSeed = {
  address: "0x0EF7fc7B6730148Af0b35e0754a1420Bad088c4E",
  data: {
    name: "Tasha Kim",
    ens: "natashajuliakim.eth",
    pfpURL: "https://station-images.nyc3.digitaloceanspaces.com/ccs-tasha-kim.jpeg",
    discordId: "natashajuliakim#8679",
    timezone: "-05:00",
    verified: true,
  },
  skills: ["design", "marketing", "social media"],
}
const courtland: ContributorSeed = {
  address: "0xfa62b9143f6b0d7e125f4e721a613a7313948c75",
  data: {
    name: "Courtland Leer",
    ens: "courtlandleer.eth",
    pfpURL: "https://station-images.nyc3.digitaloceanspaces.com/ccs-courtland-leer.jpeg",
    discordId: "courtlandleer#9582",
    timezone: "-05:00",
    verified: true,
  },
  skills: ["project management", "events", "curricula design"],
}
const thomas: ContributorSeed = {
  address: "0x9804C778D23c83ea2c7981f6cf5e3f299AEBEb9e",
  data: {
    name: "Thomas Howell",
    ens: "t-e-h.eth",
    pfpURL: "https://station-images.nyc3.digitaloceanspaces.com/ccs-thomas-howell.jpeg",
    discordId: "tehowell#2392",
    timezone: "-05:00",
    verified: true,
  },
  skills: ["project management", "events", "curricula design"],
}
const olly: ContributorSeed = {
  address: "0xB15F50e5AD35F29Bf52601d6629b3De44a3b922e",
  data: {
    name: "Olly Hunt",
    ens: "olly.eth",
    pfpURL: "https://station-images.nyc3.digitaloceanspaces.com/ccs-olly-hunt.jpeg",
    discordId: "olly#2792",
    timezone: "-05:00",
    verified: true,
  },
  skills: ["project management", "product management", "communications"],
}
const kemi: ContributorSeed = {
  address: "0x3865d06B16BF8defC9795881F7a08D12ffbAaB99",
  data: {
    name: "Kemi Akenzua",
    ens: "akenzua.eth",
    pfpURL: "https://station-images.nyc3.digitaloceanspaces.com/ccs-kemi-akenzua.jpeg",
    discordId: "kaken#8719",
    timezone: "-05:00",
    verified: true,
  },
  skills: ["events", "curricula design"],
}
const caryn: ContributorSeed = {
  address: "0x7D65B0A423c75e531BE681750514ca73Ff8B1d6A",
  data: {
    name: "Caryn Tan",
    ens: "caryntan.eth",
    pfpURL: "https://station-images.nyc3.digitaloceanspaces.com/ccs-caryn-tan.jpeg",
    discordId: "CarynTan#0040",
    timezone: "-05:00",
    verified: true,
  },
  skills: ["events", "community management"],
}
const kassen: ContributorSeed = {
  address: "0x90A0233A0c27D15ffA23E293EC8dd6f2Ef2942e2",
  data: {
    name: "Kassen Qian",
    ens: "kassen.eth",
    pfpURL:
      "https://station-images.nyc3.digitaloceanspaces.com/6c282fce-0d28-449a-a690-02437c968899",
    discordId: "kass#7081",
    timezone: "-05:00",
    verified: true,
  },
  skills: ["events", "community management"],
}
const sara: ContributorSeed = {
  address: "0xa139d29Cf66171d83E816D7b1dF768e07c9BC6Ab",
  data: {
    name: "Sara Campbell",
    ens: "saracampbell.eth",
    pfpURL: "https://station-images.nyc3.digitaloceanspaces.com/ccs-sara-campbell.jpeg",
    discordId: "segc#0866",
    timezone: "-05:00",
    verified: true,
  },
  skills: ["writing", "editing", "marketing"],
}
const aaron: ContributorSeed = {
  address: "0x48ff4d06Ceb0d69C958EE7856A2629Bb568Cffdc",
  data: {
    name: "Aaron Lamphere",
    pfpURL: "https://station-images.nyc3.digitaloceanspaces.com/ccs-aaron.jpeg",
    discordId: "adl5166#8577",
    timezone: "-05:00",
    verified: true,
  },
  skills: ["partnerships", "events", "marketing", "curricula design"],
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

    const account = await db.account.upsert({
      where: { address: contributorSeed!.address },
      create: {
        address: contributorSeed!.address,
        data: contributorSeed.data as AccountMetadata,
      },
      update: {
        data: contributorSeed.data as AccountMetadata,
      },
    })

    console.log(`  ${contributorSeed.address}, id: ${account.id}`)

    for (const s in contributorSeed.skills) {
      const skillName = contributorSeed.skills[s]!
      const skill = await db.skill.upsert({
        where: { name: skillName.toLowerCase() },
        create: {
          name: skillName.toLowerCase(),
        },
        update: {},
      })

      await db.accountSkill.upsert({
        where: {
          accountId_skillId: {
            accountId: account.id,
            skillId: skill.id,
          },
        },
        create: {
          accountId: account.id,
          skillId: skill.id,
        },
        update: {},
      })
    }
  }
}
