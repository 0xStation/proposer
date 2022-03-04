import { seed as seedTerminal } from "./0-terminal"

// This seed function is executed when you run `blitz db seed -f db/steward.ts`.
const seed = async () => {
  // //// PHASE 1
  console.log("Seeding Forefront terminal...")
  await seedTerminal()
  // //// PHASE 2
  // console.log("seeding terminal contributors...")
  // await seedTerminalContributors()
  // console.log("seeding initiative contributors...")
  // await seedInitiativeContributors()
  // console.log("seeding station contributor details...")
  // seedStationContributorDetails()
}

export default seed
