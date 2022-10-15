import db from "../index"
import { foxesAddress } from "app/core/utils/constants"

const seed = async () => {
  const terms = [
    "Harmony",
    // tbd
  ]

  // wipe old rfps
  await db.rfp.deleteMany({})

  // create new rfps
  const rfps = await db.rfp.createMany({
    data: terms.map((term) => {
      return {
        accountAddress: foxesAddress,
        data: {
          content: {
            title: term,
            body: "",
            oneLiner: "",
          },
        },
      }
    }),
  })

  console.log(rfps.count + " rfps created for foxes")
}

export default seed
