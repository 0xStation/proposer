import { seedContributors } from "./seed/contributors"
import { seedTerminals } from "./seed/terminals"
import { seedInitiatives } from "./seed/initiatives"

/*
 * This seed function is executed when you run `blitz db seed`.
 */
const seed = async () => {
  const terminals = await seedTerminals()
  await seedInitiatives(terminals)
  await seedContributors()
}

export default seed
