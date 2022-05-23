import db from "../index"

const seed = async () => {
  const handle = "stationlabs"

  const terminal = await db.terminal.findUnique({
    where: {
      handle,
    },
  })

  if (!terminal) {
    throw Error(`${handle} terminal not found`)
  }

  await db.accountTerminal.deleteMany({
    where: {
      terminalId: terminal.id,
      account: {
        address: null,
      },
    },
  })

  await db.account.deleteMany({
    where: {
      address: null,
    },
  })
}

export default seed
