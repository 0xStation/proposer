import { AccountMetadata } from "app/account/types"
import db from "./index"

// DOES NOT ACTUALLY SEED ANYTHING
// USED TO LOG DISCORD HANDLES FROM PRODUCTION DATABASE TO COPY TO A LOCAL CSV
// This seed function is executed when you run `blitz db seed -f db/query.ts`
const seed = async () => {
  console.log("Querying...")
  let count = await db.account.count({})
  console.log(count)
}

export default seed
