import db from "./index"

// This seed function is executed when you run `blitz db seed -f db/wipe.ts`
const seed = async () => {
  console.log("Wiping database rows...")
  await db.proposalNew.deleteMany()
}

export default seed
