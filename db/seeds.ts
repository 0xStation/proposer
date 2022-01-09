import { seedContributors } from "./seed/contributors"
import { seedTerminals } from "./seed/terminals"
import { seedInitiatives } from "./seed/initiatives"

/*
 * This seed function is executed when you run `blitz db seed`.
 */
const seed = async () => {
  await seedTerminals()
  await seedInitiatives()
  await seedContributors()
}

export default seed
