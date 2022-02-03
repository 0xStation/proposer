import { seedContributors } from "./seed/contributors"
import { seedSkills } from "./seed/skills"
import { seedApplications } from "./seed/applications"
import { seed as seedStationTerminal } from "./seed/station/0-terminal"

/*
 * This seed function is executed when you run `blitz db seed`.
 */
const seed = async () => {
  // console.log("Seeding contributors...")
  // await seedContributors(terminals)
  // console.log("Seeding skills")
  // await seedSkills()
  // console.log("Seeding applications")
  // await seedApplications()
  console.log("Seeding station terminal...")
  await seedStationTerminal()
}

export default seed
