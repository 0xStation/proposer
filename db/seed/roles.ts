import db from "../index"
import { Role, RoleMetadata } from "app/role/types"

const staff: RoleMetadata & { localId: number } = {
  localId: 1,
  name: "STAFF",
  value: "STAFF",
}

const dailyCommuter: RoleMetadata & { localId: number } = {
  localId: 2,
  name: "DAILY COMMUTER",
  value: "DLY COMMUTER",
}

const weekendCommuter: RoleMetadata & { localId: number } = {
  localId: 3,
  name: "WEEKEND COMMUTER",
  value: "WKD COMMUTER",
}

const visitor: RoleMetadata & { localId: number } = {
  localId: 4,
  name: "VISITOR",
  value: "VISITOR",
}

const stationRoles = [staff, dailyCommuter, weekendCommuter, visitor]

export async function seedRoles(terminals) {
  terminals.station.roles = {}
  for (const name in stationRoles) {
    const role = stationRoles[name]
    const ret = await db.role.upsert({
      where: {
        terminalRoleId: {
          terminalId: terminals.station.id,
          localId: role!.localId,
        },
      },
      create: {
        terminalId: terminals.station.id,
        localId: role!.localId,
        data: role,
      },
      update: { data: role },
    })
    console.log(`  ${(ret as Role).data?.name} localId: ${ret.localId}`)
    terminals.station.roles[ret.localId] = ret
  }
  return terminals
}
