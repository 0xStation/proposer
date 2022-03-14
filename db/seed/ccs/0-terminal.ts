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

export const roleIds = {
  staff: 1,
  teamLead: 2,
  coreContributor: 3,
  guestContributor: 4,
}

const ccs: TerminalSeed = {
  handle: "ccs",
  ticketAddress: "0x",
  data: {
    name: "Crypto, Culture and Society",
    description:
      "A learning DAO building the liberal arts for crypto and exploring web3’s broader societal impact.",
    coverURL: "https://station-images.nyc3.digitaloceanspaces.com/css_cover.png",
    pfpURL: "https://station-images.nyc3.digitaloceanspaces.com/ccs.jpeg",
    permissions: {
      invite: {
        [roleIds.staff]: [
          roleIds.staff,
          roleIds.teamLead,
          roleIds.coreContributor,
          roleIds.guestContributor,
        ],
        [roleIds.teamLead]: [roleIds.coreContributor, roleIds.guestContributor],
      }, // local id for STAFF and TEAM LEAD
    },
    contracts: {
      addresses: {
        endorsements: "0x7C3EAb35c5B87F4BBea7E3127Ebfb3ba55E94B0C",
        points: "0xECf0f56d3976aFdD67504C49d957987bA712d686",
        referrals: "0xCb4ECe9DcA605A7109eDB02d94e8292AF76F71b8",
      },
      symbols: {
        endorsements: "LEARN🅔",
        points: "LEARN🅟",
        referrals: "LEARN🅡",
      },
    },
  },
}

//////
// ROLES
//////

const staff: RoleSeed = {
  localId: roleIds.staff,
  data: {
    name: "STAFF",
    value: "STAFF",
  },
}

const teamLead: RoleSeed = {
  localId: roleIds.teamLead,
  data: {
    name: "TEAM LEAD",
    value: "TEAM LEAD",
  },
}

const coreContributor: RoleSeed = {
  localId: roleIds.coreContributor,
  data: {
    name: "CORE CONTRIBUTOR",
    value: "CORE CONTRIBUTOR",
  },
}

const guestContributor: RoleSeed = {
  localId: roleIds.guestContributor,
  data: {
    name: "GUEST CONTRIBUTOR",
    value: "GUEST CONTRIBUTOR",
  },
}

const ccsRoles = [staff, teamLead, coreContributor, guestContributor]

//////
// INITIATIVES
//////

export const initiativeIds = {
  journal: 1,
  workshops: 2,
  community: 3,
  education: 4,
  brand: 5,
  strategy: 6,
  electives: 7,
}

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

  console.log("CCS updated:", terminal)

  // for (const name in ccsRoles) {
  //   const roleSeed = ccsRoles[name]!
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
