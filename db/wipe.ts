import db from "./index"

// This seed function is executed when you run `blitz db seed -f db/wipe.ts`
const seed = async () => {
  console.log("Wiping all database rows...")
  await db.accountInitiative.deleteMany({})
  await db.accountSkill.deleteMany({})
  await db.membership.deleteMany({})
  await db.role.deleteMany({})
  await db.endorsement.deleteMany({})
  await db.skill.deleteMany({})
  await db.initiative.deleteMany({})
  await db.terminal.deleteMany({})
  await db.account.deleteMany({})
}

export default seed
