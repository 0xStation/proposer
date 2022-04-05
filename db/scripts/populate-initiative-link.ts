import db from "../index"
import { Initiative } from "app/initiative/types"

// blitz db seed -f db/scripts/populate-initiative-link.ts
const seed = async () => {
  const initiatives = (await db.initiative.findMany()) as Initiative[]

  for (let i in initiatives) {
    let initiative = initiatives[i]

    if (!initiative) {
      continue
    }

    const links = initiative?.data.links
    if (links && links.length > 0) {
      const link = links[0]

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
            link: link?.url,
          },
        },
      })
    }
  }
}

export default seed
