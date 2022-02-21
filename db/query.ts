import { AccountMetadata } from "app/account/types"
import db from "./index"

// DOES NOT ACTUALLY SEED ANYTHING
// USED TO LOG DISCORD HANDLES FROM PRODUCTION DATABASE TO COPY TO A LOCAL CSV
// This seed function is executed when you run `blitz db seed -f db/query.ts`
const seed = async () => {
  console.log("Querying...")
  let account = await db.account.findUnique({
    where: {
      address: "0x48ff4d06Ceb0d69C958EE7856A2629Bb568Cffdc",
    },
  })
  console.log(account)
}

export default seed
