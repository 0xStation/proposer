import db from "../index"

const seed = async () => {
  const foxesAddress = "0x332557dE221d09AD5b164a665c585fca0200b4B1"
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
          title: term,
          body: "",
          oneLiner: "",
        },
      }
    }),
  })

  console.log(rfps.count + "rfps created for foxes")
}

export default seed
