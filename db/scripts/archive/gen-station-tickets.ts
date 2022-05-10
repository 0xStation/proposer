import generateTicketVisual from "app/ticket/mutations/generateTicketVisual"
import db from "../../index"
import { Terminal } from "app/terminal/types"
import { Account } from "app/account/types"
import { Role } from "app/role/types"

// To run:
// blitz db seed -f db/scripts/gen-station-tickets.ts
const seed = async () => {
  console.log("Fetching station terminal memebers")
  const stationTerminal = (await db.terminal.findUnique({
    where: { handle: "stationlabs" },
  })) as Terminal

  if (!stationTerminal) {
    console.log("station terminal does not exist (or it's name is not 'stationlabs')")
    return
  }

  let stationTickets = await db.accountTerminal.findMany({
    where: {
      terminalId: stationTerminal.id,
    },
  })

  stationTickets.map(async (st) => {
    if (!st.roleLocalId) {
      console.log("This user does not have role in Station's terminal")
      return
    }

    const account = (await db.account.findUnique({
      where: { id: st.accountId },
    })) as Account

    const role = (await db.role.findUnique({
      where: {
        terminalId_localId: {
          terminalId: stationTerminal.id,
          localId: st.roleLocalId,
        },
      },
    })) as Role

    let ticketImageUrl = await generateTicketVisual({
      accountAddress: account.address,
      accountName: account.data.name,
      terminalName: stationTerminal.data.name,
      roleName: role.data.value,
    })

    if (!ticketImageUrl) {
      console.log("What happened? Error creating ticket.")
    }

    const dataCopy = JSON.parse(JSON.stringify(st.data))
    await db.accountTerminal.update({
      where: {
        accountId_terminalId: {
          accountId: account.id,
          terminalId: stationTerminal.id,
        },
      },
      data: {
        data: {
          ...dataCopy,
        },
      },
    })
  })
}

export default seed
