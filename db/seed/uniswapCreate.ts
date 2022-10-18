import db from "../index"
import { PARTNERS, TEMPLATES } from "app/core/utils/constants"
import { RfpMetadata } from "app/rfp/types"

const seed = async () => {
  const terms = [{ name: "Grants Wave 7" }]

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
          "Uniswap Foundation looks to support projects that fall into one of the following categories:\n\nProtocol Growth, including a decentralized volatility oracle, and a data analysis tool that extracts data from the Uniswap subgraph into a CSV file\n\nCommunity Growth, including a Uniswap v3 development course and events in Latin America, Africa, and Canada\n\nGovernance Stewardship, including a deep dive into the state of Uniswap delegation, which will be translated into a series of recommendations to improve governance.",
      },
      template: TEMPLATES.UNISWAP.TERM,
    } as RfpMetadata
  })
  const rfps = await db.rfp.createMany({
    data: metadatas.map((metadata) => {
      return {
        accountAddress: PARTNERS.UNISWAP.ADDRESS,
        data: metadata,
      }
    }),
  })

  console.log(rfps.count + " rfps created for Station")
}

export default seed
