import db from "../../index"
import { Initiative } from "app/deprecated/v1/initiative/types"
import { StatusOptions } from "app/deprecated/v1/initiative/types"

// blitz db seed -f db/scripts/populate-initiative-status.ts
const seed = async () => {
  const initiatives = (await db.initiative.findMany()) as Initiative[]

  for (let i in initiatives) {
    let initiative = initiatives[i]

    if (!initiative) {
      continue
    }

    const openToSubmissions = initiative?.data.isAcceptingApplications

    await db.initiative.update({
      where: {
        terminalId_localId: {
          terminalId: initiative.terminalId,
          localId: initiative.localId,
        },
      },
      data: {
        data: {
          ...initiative.data,
          status: openToSubmissions ? StatusOptions.OPEN_FOR_SUBMISSIONS : StatusOptions.ACTIVE,
        },
      },
    })
  }
}

export default seed
