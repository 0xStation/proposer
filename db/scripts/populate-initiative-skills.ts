import db from "../index"
import { Initiative } from "app/initiative/types"

// blitz db seed -f db/scripts/populate-initiative-skills.ts
const seed = async () => {
  const initiatives = (await db.initiative.findMany()) as Initiative[]

  for (let i in initiatives) {
    let initiative = initiatives[i]

    if (!initiative) {
      continue
    }

    // typescript is going to complain because skills do no exist in initiativeMetadata _anymore_
    // but they used to -- that's the whole point. We are pulling off the old model and into the knew.
    const skills = initiative?.data.skills

    const skillsData = skills
      ? {
          create: skills.map((skill) => {
            return {
              skill: {
                connectOrCreate: {
                  where: {
                    name: skill.toLowerCase(),
                  },
                  create: {
                    name: skill.toLowerCase(),
                  },
                },
              },
            }
          }),
        }
      : {}

    await db.initiative.update({
      where: {
        terminalId_localId: {
          terminalId: initiative.terminalId,
          localId: initiative.localId,
        },
      },
      data: {
        skills: skillsData,
      },
    })
  }
}

export default seed
