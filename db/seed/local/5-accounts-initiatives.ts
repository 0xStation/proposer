import { ApplicationStatus } from "app/application/types"
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

const kristen = {
  address: "0xaE55f61f85935BBB68b8809d5c02142e4CbA9a13",
  initiatives: [
    initiativeIds.waitingRoom,
    initiativeIds.midnightStation,
    initiativeIds.contributorReview,
    initiativeIds.partnership,
    initiativeIds.brandIdentity,
    initiativeIds.stationDigest,
    initiativeIds.networkSustainability,
  ],
}

const seed = async () => {
  const applicants = [chiyoko, setsuko]
  const contributors = [kristen]

  const users = applicants.concat(contributors)

  const terminal = await db.terminal.findUnique({ where: { handle: "stationlabs" } })

  if (!terminal) {
    console.log("no terminal with handle 'stationlabs' is found.")
    return
  }

  for (const name in users) {
    const contributor = users[name]!

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

      let status = applicants[name] ? "APPLIED" : "CONTRIBUTOR"
      await db.accountInitiative.create({
        data: {
          accountId: account.id,
          initiativeId: initiative.id,
          createdAt: new Date(),
          status: status as ApplicationStatus,
        },
      })
    }
  }
}

export default seed
