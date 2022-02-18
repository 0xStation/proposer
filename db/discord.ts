import { AccountMetadata } from "app/account/types"
import db from "./index"

// DOES NOT ACTUALLY SEED ANYTHING
// USED TO LOG DISCORD HANDLES FROM PRODUCTION DATABASE TO COPY TO A LOCAL CSV
// This seed function is executed when you run `blitz db seed -f db/discord.ts`
const seed = async () => {
  console.log("Fetching discord handles and addresses...")
  let accounts = await db.account.findMany({})
  accounts.forEach((a) => {
    console.log(
      `${a.address}, ${(a.data as AccountMetadata)?.discordId}, ${
        (a.data as AccountMetadata)?.name
      }`
    )
  })
}

export default seed
