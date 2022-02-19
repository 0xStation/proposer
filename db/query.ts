import { AccountMetadata } from "app/account/types"
import db from "./index"

// DOES NOT ACTUALLY SEED ANYTHING
// USED TO LOG DISCORD HANDLES FROM PRODUCTION DATABASE TO COPY TO A LOCAL CSV
// This seed function is executed when you run `blitz db seed -f db/query.ts`
const seed = async () => {
  console.log("Querying...")
  let initiatives = await db.initiative.findMany({
    where: {
      terminalId: 2,
    },
  })
  initiatives.forEach((i) => {
    console.log(`${i.id}, ${i.localId}, ${(i.data as AccountMetadata)?.name}`)
  })
}

export default seed
