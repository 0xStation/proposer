import db from "../../index"
import { initiativeIds } from "./4-initiatives"

const mima = {
  address: "0x65A3870F48B5237f27f674Ec42eA1E017E111ABC",
  initiatives: [initiativeIds.contributorReview],
}

const seed = async () => {
  const contributors = [mima]

  const terminal = await db.terminal.findUnique({ where: { handle: "stationlabs" } })

  if (!terminal) {
    console.log("no terminal with handle 'stationlabs' is found.")
    return
  }

  for (const name in contributors) {
    const contributor = contributors[name]!

    const account = await db.account.findUnique({
      where: { address: contributor.address },
    })

    if (!account) {
      console.log("cannot find that account")
      continue
    }

    for (const initiativeLocalIdIndex in contributor?.initiatives) {
      const initiativeLocalId = contributor?.initiatives[initiativeLocalIdIndex]
      const initiative = await db.initiative.findFirst({
        where: { localId: initiativeLocalId, terminalId: terminal.id },
      })

      if (!initiative) {
        console.log("cannot find initiative")
        continue
      }

      await db.accountInitiative.create({
        data: {
          accountId: account.id,
          initiativeId: initiative.id,
          createdAt: new Date(),
          status: "APPLIED",
        },
      })
    }
  }
}

export default seed
