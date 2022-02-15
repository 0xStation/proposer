import db from "../../index"

interface ContributorSeed {
  address: string
  joinedAt: Date
  role: number
}

const roleIds = {
  staff: 1,
  dailyCommuter: 2,
  weekendCommuter: 3,
  visitor: 4,
}

const michael: ContributorSeed = {
  address: "0x65A3870F48B5237f27f674Ec42eA1E017E111D63",
  joinedAt: new Date("2021-12-01"),
  role: roleIds.dailyCommuter,
}

const seed = async () => {
  const contributors = [michael]
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

    const accountTerminal = await db.accountTerminal.create({
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
