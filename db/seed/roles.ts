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
  value: "DAILY COMMUTER",
}

const weekendCommuter: RoleMetadata & { localId: number } = {
  localId: 3,
  name: "WEEKEND COMMUTER",
  value: "WEEKEND COMMUTER",
}

const visitor: RoleMetadata & { localId: number } = {
  localId: 4,
  name: "VISITOR",
  value: "VISITOR",
}

const stationRoles = [staff, dailyCommuter, weekendCommuter, visitor]

export async function seedRoles(terminals) {
  terminals.StationLabs.roles = {}
  for (const name in stationRoles) {
    const role = stationRoles[name]
    const ret = await db.role.upsert({
      where: {
        terminalId_localId: {
          terminalId: terminals.StationLabs.id,
          localId: role!.localId,
        },
      },
      create: {
        terminalId: terminals.StationLabs.id,
        localId: role!.localId,
        data: role,
      },
      update: { data: role },
    })
    console.log(`  ${(ret as Role).data?.name} localId: ${ret.localId}`)
    terminals.StationLabs.roles[ret.localId] = ret
  }
  return terminals
}
