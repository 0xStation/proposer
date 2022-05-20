import db from "../index"
import { RoleMetadata } from "app/role/types"
import { InitiativeMetadata } from "app/deprecated/v1/initiative/types"
import { toTitleCase } from "app/core/utils/titleCase"

// To run:
// blitz db seed -f db/scripts/gen-station-tickets.ts
const seed = async () => {
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

  await db.tag.createMany({
    data: [...statusTags, ...initiativeTags, ...roleTags],
  })

  const newTags = (await db.tag.findMany()).filter((t) => !!t.data)

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
      initiativeToTag[initiativeId] = t
    }
    const roleLocalId = data["roleLocalId"]
    if (roleLocalId) {
      if (!roleToTag[t.terminalId]) {
        roleToTag[t.terminalId] = {
          roleLocalId: t,
        }
      } else {
        roleToTag[t.terminalId][roleLocalId] = t
      }
    }
  })

  const accountInitiatives = await db.accountInitiative.findMany({
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

  await db.accountTerminalTag.createMany({
    data: [...accountInitiativeTags, ...accountTerminalTags],
  })
}

export default seed
