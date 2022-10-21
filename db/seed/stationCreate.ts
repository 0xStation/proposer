import db, { TokenType } from "../index"
import { PARTNERS, TEMPLATES } from "app/core/utils/constants"
import { RfpMetadata } from "app/rfp/types"

const seed = async () => {
  const terms = [{ name: "Partnerships" }, { name: "Developers" }]

  // wipe old rfps
  // await db.rfp.deleteMany({})

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
      singleTokenGate: {
        token: {
          chainId: 1,
          address: "0xBa767D65a7164E151783e42994Bd475509F256Dd",
          type: TokenType.ERC721,
          name: "Station Labs Passport",
          symbol: "STATION",
        },
        minBalance: "1",
      },
    } as RfpMetadata
  })

  const rfps = await db.rfp.createMany({
    data: metadatas.map((metadata) => {
      return {
        accountAddress: PARTNERS.STATION.ADDRESS,
        templateId: "cd28828c-e51a-4796-80f5-e39d4cc43fab",
        data: metadata,
      }
    }),
  })

  console.log(rfps.count + " rfps created for Station")
}

export default seed
