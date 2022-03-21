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
        data: initiative.data,
        skills: skillsData,
      },
    })
  }
}

export default seed
