import { AccountInitiativeStatus } from "@prisma/client"
import { AccountMetadata } from "app/account/types"
import { ApplicationMetadata } from "app/deprecated/v1/application/types"
import { InitiativeMetadata } from "app/deprecated/v1/initiative/types"
import db from "../index"

// To run:
// blitz db seed -f db/scripts/v2-applications-csv.ts
const seed = async () => {
  const apps = await db.accountInitiative.findMany({
    where: { status: AccountInitiativeStatus.INTERESTED },
    orderBy: {
      initiative: {
        terminalId: "asc",
      },
    },
    include: {
      initiative: true,
      account: true,
    },
  })
  console.log("terminal-id,submitted-at,initiative,submission,links,name,contact,bio")
  apps.forEach((a) => {
    const acct = a.account.data as AccountMetadata
    console.log(
      `${
        a.initiative.terminalId
      },${a.createdAt.getMonth()}/${a.createdAt.getDate()}/${a.createdAt.getFullYear()},${
        (a.initiative.data as InitiativeMetadata).name
      },${(a.data as ApplicationMetadata)?.entryDescription?.replace(",", ";") || ""},${
        (a.data as ApplicationMetadata)?.urls || ""
      },${acct.name},${acct.contactURL || ""},${acct.bio || ""}`
    )
  })
  // now take terminal output, paste it into a new csv file, and open which will load default sheet application
  // using terminal-id, separate into multiple sheets (one per terminal)
  // demo video: https://www.loom.com/share/2b5100666c294e8e9f7c7b00a9432b57
}

export default seed
