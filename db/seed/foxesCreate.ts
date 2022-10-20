import db from "../index"
import { PARTNERS, TEMPLATES } from "app/core/utils/constants"
import { RfpMetadata } from "app/rfp/types"
import { TokenType } from "@prisma/client"

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
  await db.rfp.deleteMany({})

  // create new rfps
  const metadatas = terms.map((term) => {
    return {
      content: {
        title: term.name,
        body: "",
        oneLiner: "",
        submissionGuideline:
          "Please make sure your submission is 125+ words, and double check for typos.\n\nSubmissions should be fully aligned with, and inclusive of, already established Philosophical Foxes lore. The best entries will connect to other entries in a way that expands the known lore and creates new connections that were previously unknown. Entries should be written in the voice of fox historians in the future. This means that they can be opinionated and inclusive of knowledge not yet known to our current generation of foxes.",
      },
      template: TEMPLATES.FOXES.TERM,
      singleTokenGate: {
        token: {
          chainId: 1,
          address: "0x55256178aFE74082c4f9aFEF7E40fec949c1b499",
          type: TokenType.ERC721,
          name: "Philosophical Foxes",
          symbol: "FOX",
        },
      },
    } as RfpMetadata
  })
  // chainId: number
  // address: string
  // type: TokenType
  // name?: string
  // symbol?: string
  // decimals?: number

  const template = await db.template.create({
    data: {
      chainId: 5, // change to 1 when on production
      data: {
        title: "Foxes Template",
        fields: TEMPLATES.STATION.TERM,
      },
    },
  })

  const rfps = await db.rfp.createMany({
    data: metadatas.map((metadata) => {
      return {
        accountAddress: PARTNERS.FOXES.ADDRESS,
        templateId: template?.id as string,
        data: metadata,
      }
    }),
  })

  console.log(rfps.count + " rfps created for Foxes")
}

export default seed
