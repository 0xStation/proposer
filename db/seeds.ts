import { seedContributors } from "./seed/contributors"
import { seedTerminals } from "./seed/terminals"
import { seedInitiatives } from "./seed/initiatives"
import { seedRoles } from "./seed/roles"
import { seedSkills } from "./seed/skills"
import { seedApplications } from "./seed/applications"

/*
 * This seed function is executed when you run `blitz db seed`.
 */
const seed = async () => {
  console.log("Seeding terminals...")
  let terminals = await seedTerminals()
  console.log("Seeding initiatives...")
  terminals = await seedInitiatives(terminals)
  console.log("Seeding roles...")
  terminals = await seedRoles(terminals)
  console.log("Seeding contributors...")
  await seedContributors(terminals)
  console.log("Seeding skills")
  await seedSkills()
  console.log("Seeding applications")
  await seedApplications()
}

export default seed
