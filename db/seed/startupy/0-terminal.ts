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

export const terminalId = 4

const startupy: TerminalSeed = {
  handle: "startupy",
  ticketAddress: "0xstartupy",
  data: {
    name: "Startupy",
    description: "Startupy is where you stat up to speed on the pulse of startup culture.",
    coverURL: "https://station-images.nyc3.digitaloceanspaces.com/startupy-banner.jpeg",
    pfpURL: "https://station-images.nyc3.digitaloceanspaces.com/startupy-pfp.jpeg",
    permissions: {
      invite: {}, // local id for STAFF and TEAM LEAD
    },
    contracts: {
      addresses: {
        endorsements: "0x6566075DfdAc6740A076b3c856dB2988e14a26F0", // dead erc20 token
        points: "0x6566075DfdAc6740A076b3c856dB2988e14a26F0", // dead erc20 token
        referrals: "0x0000000000000000000000000000000000000000",
      },
      symbols: {
        endorsements: "STARTUPY🅔",
        points: "STARTUPY🅟",
        referrals: "STARTUPY🅡",
      },
    },
    hide: true,
  },
}

//////
// ROLES
//////

export const roleIds = {
  core: 1,
  curator: 2,
  member: 3,
}

const core: RoleSeed = {
  localId: roleIds.core,
  data: {
    name: "CORE",
    value: "CORE",
  },
}

const curator: RoleSeed = {
  localId: roleIds.curator,
  data: {
    name: "CURATOR",
    value: "CURATOR",
  },
}

const member: RoleSeed = {
  localId: roleIds.member,
  data: {
    name: "MEMBER",
    value: "MEMBER",
  },
}

const startupyRoles = [core, curator, member]

//////
// INITIATIVES
//////

export const initiativeIds = {
  vibes: 1,
}

const vibes: InitiativeSeed = {
  localId: initiativeIds.vibes,
  data: {
    name: "✨Vibes✨",
    oneLiner: "Curating culture.",
    isAcceptingApplications: true,
    contributeText: [],
    rewardText: ["Startupy Contributor NFT"],
    skills: [],
    commitment: "Part-time",
    bannerURL: "",
    links: [],
  },
}

const startupyInitiatives = [vibes]

export async function seed() {
  let terminal = (await db.terminal.upsert({
    where: { handle: startupy.handle.toLowerCase() },
    create: {
      ticketAddress: startupy.ticketAddress,
      handle: startupy.handle.toLowerCase(),
      data: startupy.data,
    },
    update: {
      ticketAddress: startupy.ticketAddress,
      handle: startupy.handle.toLowerCase(),
      data: startupy.data,
    },
  })) as Terminal

  console.log("startupy updated:", terminal)

  for (const name in startupyRoles) {
    const roleSeed = startupyRoles[name]!
    const role = await db.role.upsert({
      where: {
        terminalId_localId: {
          terminalId: terminal.id,
          localId: roleSeed.localId,
        },
      },
      create: {
        terminalId: terminal.id,
        localId: roleSeed.localId,
        data: roleSeed.data,
      },
      update: { data: roleSeed.data },
    })
    console.log(`  ${(role as Role).data?.name} localId: ${roleSeed.localId}`)
  }

  for (const name in startupyInitiatives) {
    const initiativeSeed = startupyInitiatives[name]!
    const initiative = await db.initiative.upsert({
      where: {
        terminalId_localId: {
          terminalId: terminal.id,
          localId: initiativeSeed.localId,
        },
      },
      create: {
        terminalId: terminal.id,
        localId: initiativeSeed.localId,
        data: initiativeSeed.data,
      },
      update: { data: initiativeSeed.data },
    })
    console.log(`  ${(initiative as Initiative).data?.name} localId: ${initiative.localId}`)
  }
}
