import db from "../../index"
import { Terminal, TerminalMetadata } from "app/terminal/types"
import { Initiative, InitiativeMetadata } from "app/initiative/types"
import { Role, RoleMetadata } from "app/role/types"
import { Symbol } from "app/types"

type TerminalSeed = {
  ticketAddress: string
  handle: string
  data: TerminalMetadata
}

type RoleSeed = {
  localId: number
  data: RoleMetadata
}

type InitiativeSeed = {
  localId: number
  data: InitiativeMetadata
}

//////
// TERMINAL
//////

export const terminalId = 2

const ccs: TerminalSeed = {
  handle: "forefront",
  ticketAddress: "0xforefront",
  data: {
    name: "Forefront",
    description:
      "Forefront is the premier Web3 Social community, crafting resources & social spaces to help tokenized communities thrive.",
    coverURL: "https://station-images.nyc3.digitaloceanspaces.com/forefront-banner.png",
    pfpURL: "https://station-images.nyc3.digitaloceanspaces.com/forefront-pfp.png",
    permissions: {
      invite: { rolesAllowedToInvite: [1] }, // local id for STAFF and TEAM LEAD
    },
    contracts: {
      addresses: {
        endorsements: "0x6566075DfdAc6740A076b3c856dB2988e14a26F0", // dead erc20 token
        points: "0x6566075DfdAc6740A076b3c856dB2988e14a26F0", // dead erc20 token
        referrals: "0x0000000000000000000000000000000000000000",
      },
      symbols: {
        endorsements: "FF🅔",
        points: "FF🅟",
        referrals: "FF🅡",
      },
    },
    hide: true,
  },
}

//////
// ROLES
//////

export const roleIds = {}

const forefrontRoles = []

//////
// INITIATIVES
//////

export const initiativeIds = {}

export async function seed() {
  let terminal = (await db.terminal.upsert({
    where: { handle: ccs.handle.toLowerCase() },
    create: {
      ticketAddress: ccs.ticketAddress,
      handle: ccs.handle.toLowerCase(),
      data: ccs.data,
    },
    update: {
      ticketAddress: ccs.ticketAddress,
      handle: ccs.handle.toLowerCase(),
      data: ccs.data,
    },
  })) as Terminal

  console.log("Forefront updated:", terminal)

  // for (const name in forefrontRoles) {
  //   const roleSeed = forefrontRoles[name]!
  //   const role = await db.role.upsert({
  //     where: {
  //       terminalId_localId: {
  //         terminalId: terminal.id,
  //         localId: roleSeed.localId,
  //       },
  //     },
  //     create: {
  //       terminalId: terminal.id,
  //       localId: roleSeed.localId,
  //       data: roleSeed.data,
  //     },
  //     update: { data: roleSeed.data },
  //   })
  //   console.log(`  ${(role as Role).data?.name} localId: ${roleSeed.localId}`)
  // }
}
