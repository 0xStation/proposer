import { seedContributors } from "./seed/contributors"
import { seedTerminals } from "./seed/terminals"
import { seedInitiatives } from "./seed/initiatives"
import { seedSkills } from "./seed/skills"

/*
 * This seed function is executed when you run `blitz db seed`.
 */
const seed = async () => {
  console.log("Seeding terminals...")
  const terminals = await seedTerminals()
  console.log("Seeding initiatives...")
  await seedInitiatives(terminals)
  console.log("Seeding contributors...")
  await seedContributors(terminals)
  console.log("Seeding skills")
  await seedSkills()
}

export default seed
