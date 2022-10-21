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
        submissionGuideline: "Submit your interest to contribute to the Station Network!",
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
