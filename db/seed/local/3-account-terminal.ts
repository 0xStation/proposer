import db from "../../index"
import { roleIds } from "./1-terminals"

interface ContributorSeed {
  address: string
  joinedAt: Date
  role: number
}

const chiyoko: ContributorSeed = {
  address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  joinedAt: new Date("2022-1-27"),
  role: roleIds.staff,
}

const kristen: ContributorSeed = {
  address: "0xaE55f61f85935BBB68b8809d5c02142e4CbA9a13",
  joinedAt: new Date("2021-12-01"),
  role: roleIds.staff, // making it easy to allow myself to invite peopl
}

const seed = async () => {
  const contributors = [kristen, chiyoko]
  const terminal = await db.terminal.findUnique({ where: { handle: "stationlabs" } })

  if (!terminal) {
    console.log("no terminal with handle 'stationlabs' is found.")
    return
  }

  for (const name in contributors) {
    const contributorSeed = contributors[name]! as ContributorSeed
    const account = await db.account.findUnique({ where: { address: contributorSeed.address } })

    if (!account) {
      console.log(`no account found with name ${name}, address ${contributorSeed.address}`)
      continue
    }

    await db.accountTerminal.create({
      data: {
        accountId: account.id,
        terminalId: terminal.id,
        roleLocalId: contributorSeed.role,
        joinedAt: contributorSeed.joinedAt,
      },
    })
  }
}

export default seed
