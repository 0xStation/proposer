import db from "db"
import { PARTNERS, TEMPLATES } from "app/core/utils/constants"
import { RfpMetadata } from "app/rfp/types"
import { TokenType } from "@prisma/client"

const seed = async () => {
  const rfps = [
    { title: "Terra Volpa" },
    { title: "Perdita" },
    { title: "Alucinora" },
    { title: "Shadowoods" },
    { title: "Rostrum" },
    { title: "Grand Hannibal" },
    { title: "Cax" },
    { title: "Multo" },
    { title: "Dark Sea" },
    { title: "Slow Copse" },
    { title: "Chrome Peak" },
    { title: "Long Lagoon" },
    { title: "Oseaan" },
    { title: "Sleeping River" },
    { title: "Little-End" },
    { title: "Mahka" },
    { title: "Mimicgorge" },
    { title: "Singan" },
    { title: "Karai-Gol" },
    { title: "Telescope hills" },
    { title: "Corpus Colossi" },
    { title: "Trace Fork" },
    { title: "The Unknowing" },
    { title: "Silly Hills" },
    { title: "Kapatagan Plains" },
    { title: "Stogai" },
    { title: "Absentia Pass" },
    { title: "Interruptors" },
    { title: "Hamoban Feuen" },
    { title: "Splinter Lightning" },
    { title: "Not-here River" },
    { title: "Hidden Hillocks" },
    { title: "Somni" },
    { title: "The Long Sleep" },
    { title: "Belua The Insane" },
    { title: "Binary Fur" },
    { title: "Limnus" },
    { title: "Ore" },
    { title: "Catalus" },
    { title: "Feral Range" },
    { title: "Zwilling" },
    { title: "Retrogradi" },
    { title: "Hummm" },
    { title: "The Ellipsis" },
    { title: "Genesis Foxes" },
    { title: "Noosphere N00b" },
    { title: "Uwu" },
    { title: "Smooth Love Potion" },
    { title: "Proletkult" },
    { title: "Gifted Child Syndrome" },
  ]

  const newRfps = await db.rfp.createMany({
    data: rfps.map((rfp) => {
      return {
        accountAddress: PARTNERS.RADICLE.ADDRESS,
        templateId: TEMPLATES.FOXES.TERMS.id,
        data: {
          content: {
            title: rfp.title,
            oneLiner: "",
            body: "Please make sure your submission is 125+ words, and double check for typos.\n\nSubmissions should be fully aligned with, and inclusive of, already established Philosophical Foxes lore. The best entries will connect to other entries in a way that expands the known lore and creates new connections that were previously unknown. Entries should be written in the voice of fox historians in the future. This means that they can be opinionated and inclusive of knowledge not yet known to our current generation of foxes.",
          },
          singleTokenGate: {
            token: {
              chainId: 1,
              address: "0x55256178aFE74082c4f9aFEF7E40fec949c1b499",
              type: TokenType.ERC721,
              name: "Philosophical Foxes",
              symbol: "FOX",
            },
            minBalance: "1",
          },
        },
      }
    }),
  })

  console.log(newRfps.count + " rfps created for FOXES")
}

export default seed
