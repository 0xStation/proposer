import db from "../index"
import { RoleMetadata } from "app/role/types"
import { InitiativeMetadata } from "app/deprecated/v1/initiative/types"
import { toTitleCase } from "app/core/utils/titleCase"

// To run:
// blitz db seed -f db/scripts/v2-members-launch.ts
const seed = async () => {
  // fresh wipe on all tags
  await db.tag.deleteMany()
  await db.accountTerminalTag.deleteMany()

  // create Active/Inactive STATUS tags per terminal
  const terminals = await db.terminal.findMany()
  const statusTags = terminals.reduce(
    (acc, t) => [
      ...acc,
      {
        type: "status",
        value: "Active",
        terminalId: t.id,
        data: {
          active: true,
        },
      },
      {
        type: "status",
        value: "Inactive",
        terminalId: t.id,
        data: {
          inactive: true,
        },
      },
    ],
    []
  )

  // create INITIATIVE tags per initiative
  const initiatives = await db.initiative.findMany()
  const initiativeTags = initiatives.map((i) => {
    return {
      type: "initiative",
      value: toTitleCase((i.data as InitiativeMetadata).name),
      terminalId: i.terminalId,
      data: {
        initiativeId: i.id,
      },
    }
  })

  // create ROLE tags per role
  const roles = await db.role.findMany({})
  const roleTags = roles.map((r) => {
    return {
      type: "role",
      value: toTitleCase((r.data as RoleMetadata).name),
      terminalId: r.terminalId,
      data: {
        roleLocalId: r.localId,
      },
    }
  })

  // generate all new tags in one query
  await db.tag.createMany({
    data: [...statusTags, ...initiativeTags, ...roleTags],
  })

  const newTags = (await db.tag.findMany()).filter((t) => !!t.data)

  // prepare dictionaries to access tag objects by properties
  let activeToTag = {}
  let inactiveToTag = {}
  let initiativeToTag = {}
  let roleToTag = {}
  newTags.forEach((t) => {
    const data = t.data
    if (!data) {
      return
    }
    const active = data["active"]
    if (active) {
      activeToTag[t.terminalId] = t.id
    }
    const inactive = data["inactive"]
    if (inactive) {
      inactiveToTag[t.terminalId] = t.id
    }
    const initiativeId = data["initiativeId"]
    if (initiativeId) {
      initiativeToTag[initiativeId] = t.id
    }
    const roleLocalId = data["roleLocalId"]
    if (roleLocalId) {
      if (!roleToTag[t.terminalId]) {
        roleToTag[t.terminalId] = {
          [roleLocalId]: t.id,
        }
      } else {
        roleToTag[t.terminalId][roleLocalId] = t.id
      }
    }
  })

  // generate accountTerminal<->Tag associations from initiative contributorships
  const accountInitiatives = await db.accountInitiative.findMany({
    where: { status: "CONTRIBUTING" },
    include: {
      initiative: true,
    },
  })
  const accountInitiativeTags = accountInitiatives.map((ai) => {
    return {
      tagId: initiativeToTag[ai.initiativeId],
      ticketAccountId: ai.accountId,
      ticketTerminalId: ai.initiative.terminalId,
    }
  })
  // generate accountTerminal<->Tag associations from accountTerminals
  // responsible for both ROLE tags and STATUS tags
  const accountTerminals = await db.accountTerminal.findMany()
  const accountTerminalTags = accountTerminals.reduce(
    (acc, at) => [
      ...acc,
      {
        tagId: roleToTag[at.terminalId][at.roleLocalId],
        ticketAccountId: at.accountId,
        ticketTerminalId: at.terminalId,
      },
      at.active
        ? {
            tagId: activeToTag[at.terminalId],
            ticketAccountId: at.accountId,
            ticketTerminalId: at.terminalId,
          }
        : {
            tagId: inactiveToTag[at.terminalId],
            ticketAccountId: at.accountId,
            ticketTerminalId: at.terminalId,
          },
    ],
    []
  )
  // generate all accountTerminal<->Tag associations in one query
  await db.accountTerminalTag.createMany({
    data: [...accountInitiativeTags, ...accountTerminalTags],
  })
}

export default seed
