import db from "../../index"
import { RoleMetadata } from "app/role/types"

type RoleSeed = {
  localId: number
  data: RoleMetadata
}

export const roleIds = {
  staff: 1,
  dailyCommuter: 2,
  weekendCommuter: 3,
  visitor: 4,
}

const staff: RoleSeed = {
  localId: roleIds.staff,
  data: {
    name: "STAFF",
    value: "STAFF",
  },
}

const dailyCommuter: RoleSeed = {
  localId: roleIds.dailyCommuter,
  data: {
    name: "DAILY COMMUTER",
    value: "DAILY COMMUTER",
  },
}

const weekendCommuter: RoleSeed = {
  localId: roleIds.weekendCommuter,
  data: {
    name: "WEEKEND COMMUTER",
    value: "WEEKEND COMMUTER",
  },
}

const visitor: RoleSeed = {
  localId: roleIds.visitor,
  data: {
    name: "VISITOR",
    value: "VISITOR",
  },
}

const stationRoles = [staff, dailyCommuter, weekendCommuter, visitor]

const seed = async () => {
  const terminal = await db.terminal.findUnique({ where: { handle: "stationlabs" } })

  if (!terminal) {
    console.log("no terminal with handle 'stationlabs' is found.")
    return
  }

  for (const name in stationRoles) {
    const roleSeed = stationRoles[name]!
    await db.role.create({
      data: {
        terminalId: terminal.id,
        localId: roleSeed.localId,
        data: roleSeed.data,
      },
    })
  }
}

export default seed
