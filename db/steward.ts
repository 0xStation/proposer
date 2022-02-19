import { seed as seedSkills } from "./seed/skills"
import { seed as seedStationTerminal } from "./seed/station/0-terminal"
import { seed as seedStationTerminalContributors } from "./seed/station/1-contributor-terminal"
import { seed as seedStationInitiativeContributors } from "./seed/station/2-contributor-initiative"
import { seed as seedStationContributorDetails } from "./seed/station/3-contributor-details"
import { seed as seedCCSTerminal } from "./seed/ccs/0-terminal"
import { seed as seedCCSContributors } from "./seed/ccs/1-contributors"
import { seed as seedCCSTerminalContributors } from "./seed/ccs/2-contributor-terminal"
import { seed as seedCCSInitiativeContributors } from "./seed/ccs/3-contributor-initiatives"
// import { seed as seedCCSInitiativeContributors } from "./seed/ccs/2-contributor-initiative"
// import { seed as seedCCSContributorDetails } from "./seed/ccs/3-contributor-details"

// This seed function is executed when you run `blitz db seed -f db/steward.ts`.
const seed = async () => {
  // //// PHASE 1
  // console.log("Seeding skills...")
  // await seedSkills()
  console.log("Seeding CCS terminal...")
  // await seedCCSTerminal()
  // await seedCCSContributors()
  // await seedCCSTerminalContributors()
  await seedCCSInitiativeContributors()
  // //// PHASE 2
  // console.log("seeding terminal contributors...")
  // await seedStationTerminalContributors()
  // console.log("seeding initiative contributors...")
  // await seedStationInitiativeContributors()
  // console.log("seeding station contributor details...")
  // seedStationContributorDetails()
}

export default seed
