import { seedContributors } from "./seed/contributors"
import { seedTerminals } from "./seed/terminals"
import { seedInitiatives } from "./seed/initiatives"

/*
 * This seed function is executed when you run `blitz db seed`.
 */
const seed = async () => {
  console.log("Seeding terminals...")
  const terminals = await seedTerminals()
  console.log("Seeding initiatives...")
  await seedInitiatives(terminals)
  console.log("Seeding contributors...")
  await seedContributors()
}

export default seed
