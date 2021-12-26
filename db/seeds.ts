import db from "./index"

/*
 * This seed function is executed when you run `blitz db seed`.
 *
 * Probably you want to use a library like https://chancejs.com
 * or https://github.com/Marak/Faker.js to easily generate
 * realistic data.
 */
const seed = async () => {
  let terminal = await db.terminal.create({
    data: {
      name: "Station",
      handle: "station",
      description: "Building the infrastructure to empower the next billion contributors in web3.",
      subgraphId: "",
      ticketContract: "",
    },
  })
}

export default seed
