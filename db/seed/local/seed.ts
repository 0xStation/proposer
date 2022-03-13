import wipe from "../../wipe"
import seedAccounts from "../local/0-accounts"
import seedTerminals from "../local/1-terminals"
import seedRoles from "../local/2-roles"
import seedAccountTerminals from "../local/3-account-terminal"
import seedInitiatives from "../local/4-initiatives"
import seedAccountInitiatives from "../local/5-accounts-initiatives"

const seed = async () => {
  // wipe the database clean before loading up data
  await wipe()
  // seeding all data
  await seedAccounts()
  await seedTerminals()
  await seedRoles()
  await seedAccountTerminals()
  await seedInitiatives()
  await seedAccountInitiatives()
}

export default seed
