import db from "../index"
import { PARTNERS, TEMPLATES } from "app/core/utils/constants"
import { RfpMetadata } from "app/rfp/types"

const seed = async () => {
  const terms = [
    { name: "Terra Volpa" },
    { name: "Perdita" },
    { name: "Alucinora" },
    { name: "Shadowoods" },
    { name: "Rostrum" },
    { name: "Grand Hannibal" },
    { name: "Cax" },
    { name: "Multo" },
    { name: "Dark Sea" },
    { name: "Slow copse" },
    { name: "shrome peak" },
    { name: "Long lagoon" },
    { name: "Oseaan" },
    { name: "Sleeping river" },
    { name: "Little-Sno" },
    { name: "Mamita" },
    { name: "Mimicgorge" },
    { name: "Singan" },
    { name: "Karai-Gol Zwilling" },
    { name: "Telescope hills" },
    { name: "Corpus Colossi" },
    { name: "Trace Fork" },
    { name: "The Unknowing" },
    { name: "Silly Hills" },
    { name: "Kapatagan Plains" },
    { name: "Stogai" },
    { name: "Absentia Pass" },
    { name: "Interruptors" },
    { name: "Hamoban Feuen" },
    { name: "Splinter Lightning" },
    { name: "Not-here river" },
    { name: "HIdden Hillocks" },
    { name: "Somni" },
    { name: "The Long Sleep" },
    { name: "Belua The Insane" },
    { name: "Binary fur" },
    { name: "Limnus" },
    { name: "Ore" },
    { name: "Catalus" },
    { name: "Feral Range" },
    { name: "Chrome Peak" },
    { name: "Retrogradi" },
    { name: "Hummm" },
    { name: "The Ellipsis" },
    { name: "Genesis foxes" },
    { name: "Noosphere N00b" },
    { name: "Uwu" },
    { name: "Smooth love potion" },
    { name: "Proletkult" },
    { name: "Gifted Child Syndrome" },
  ]

  // wipe old rfps
  // await db.rfp.deleteMany({})

  // create new rfps
  const metadatas = terms.map((term) => {
    return {
      content: {
        title: term.name,
        body: "",
        oneLiner: "",
      },
      template: TEMPLATES.STATION.TERM,
    } as RfpMetadata
  })
  const rfps = await db.rfp.createMany({
    data: metadatas.map((metadata) => {
      return {
        accountAddress: PARTNERS.STATION.ADDRESS,
        data: metadata,
      }
    }),
  })

  console.log(rfps.count + " rfps created for Station")
}

export default seed
