import db from "../../index"
import { initiativeIds } from "./4-initiatives"

const chiyoko = {
  address: "0x1E8f3C0286b4949e8eB1F5d705b49016dc84D288",
  initiatives: [initiativeIds.newstand],
}

const setsuko = {
  address: "0x4038d6B8fa427812869cf406BaD5041D31F0a17C",
  initiatives: [initiativeIds.newstand],
}

const seed = async () => {
  const contributors = [chiyoko, setsuko]

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
