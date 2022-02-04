import { seed as seedSkills } from "./seed/skills"
import { seed as seedStationTerminal } from "./seed/station/0-terminal"
import { seed as seedStationTerminalContributors } from "./seed/station/1-contributor-terminal"
import { seed as seedStationInitiativeContributors } from "./seed/station/2-contributor-initiative"
import { seed as seedStationContributorDetails } from "./seed/station/3-contributor-details"

/*
 * This seed function is executed when you run `blitz db seed`.
 */
const seed = async () => {
  ////// PHASE 1
  // console.log("Seeding skills...")
  // await seedSkills()
  // console.log("Seeding station terminal...")
  // await seedStationTerminal()
  ////// PHASE 2
  // console.log("seeding terminal contributors...")
  // await seedStationTerminalContributors()
  // console.log("seeding initiative contributors...")
  // await seedStationInitiativeContributors()
  console.log("seeding station contributor details...")
  seedStationContributorDetails()
}

export default seed
