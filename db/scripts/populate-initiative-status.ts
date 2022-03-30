import db from "../index"
import { Initiative } from "app/initiative/types"
import { OPEN_TO_SUBMISSIONS, ACTIVE } from "app/utils/initiativeStatusOptions"

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
          status: !initiative.data.status && openToSubmissions ? OPEN_TO_SUBMISSIONS : ACTIVE,
        },
      },
    })
  }
}

export default seed
