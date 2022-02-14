import db from "../index"
import { AccountMetadata } from "app/account/types"
import { InitiativeMetadata } from "app/initiative/types"

interface ContributorSeed {
  address: string
  applications: number[]
  data: {
    name?: string
    ens?: string
    verified?: boolean
    pfpURL?: string
  }
}

const maya: ContributorSeed = {
  address: "0x733d9ec734d5fb181afb33750cdd71c0eb1b1d62",
  applications: [3],
  data: {
    name: "maya",
    pfpURL:
      "https://user-images.githubusercontent.com/38736612/151722561-ba3b7d89-cb9f-4ad2-86de-73ff3dc3d286.png",
  },
}

export async function seed() {
  const account = await db.account.findUnique({
    where: { address: "0x016562aA41A8697720ce0943F003141f5dEAe006" },
  })

  if (!account) {
    console.log(
      `no account found with name ${name}, address ${"0x016562aA41A8697720ce0943F003141f5dEAe006"}`
    )
    return
  }

  const accountTerminal = await db.accountTerminal.upsert({
    where: {
      accountId_terminalId: {
        accountId: account?.id,
        terminalId: 1,
      },
    },
    create: {
      accountId: account.id,
      terminalId: 1,
      roleLocalId: 1,
      //   joinedAt: contributorSeed.joinedAt,
    },
    update: {
      roleLocalId: 1,
      //   joinedAt: contributorSeed.joinedAt,
    },
  })

  console.log(
    `Contributor updated: accountId ${accountTerminal.accountId}, role ${accountTerminal.roleLocalId}, joinedAt ${accountTerminal.joinedAt}`
  )

  //   const account = await db.account.upsert({
  //     where: {
  //       address: maya.address,
  //     },
  //     create: {
  //       address: maya.address,
  //       data: maya.data,
  //     },
  //     update: {
  //       data: maya.data,
  //     },
  //   })

  //   console.log(`updated ${(account.data as AccountMetadata)?.name}`)

  //   for (const i in maya.applications) {
  //     const localId = maya.applications[i] as number
  //     const initiative = await db.initiative.findUnique({
  //       where: {
  //         terminalId_localId: {
  //           terminalId: 1,
  //           localId,
  //         },
  //       },
  //     })

  //     if (!initiative) {
  //       console.log(`could not find localId of ${localId}`)
  //       continue
  //     }

  //     const accountInitiative = await db.accountInitiative.upsert({
  //       where: {
  //         accountId_initiativeId: {
  //           accountId: account.id,
  //           initiativeId: initiative.id,
  //         },
  //       },
  //       create: {
  //         accountId: account.id,
  //         initiativeId: initiative.id,
  //         status: "APPLIED",
  //       },
  //       update: {
  //         status: "APPLIED",
  //       },
  //     })

  //     console.log(
  //       `contributor ${maya.address}, initiative ${
  //         (initiative.data as InitiativeMetadata)?.name
  //       }, status ${accountInitiative.status}`
  //     )
  //   }
}
