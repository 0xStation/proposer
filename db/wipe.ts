import db from "./index"
/*
 * This seed function is executed when you run `blitz db seed -f db/wipe.ts`.
 */
const seed = async () => {
  console.log("Wiping all database rows...")
  await db.applicationEndorsement.deleteMany({})
  await db.initiativeApplication.deleteMany({})
  await db.initiative.deleteMany({})
  await db.terminal.deleteMany({})
  await db.account.deleteMany({})
}

export default seed
