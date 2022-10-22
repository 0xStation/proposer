import db from "db"
import { PARTNERS, TEMPLATES } from "app/core/utils/constants"
import { RfpMetadata } from "app/rfp/types"

const seed = async () => {
  const rfps = [
    {
      title: "Design Uniswap’s POAP",
      submissionGuideline:
        "Designing Uniswap’s POAP based on Uniswap’s [brand guideline](https://uniswap.org/blog/brand-update).",
      templateId: TEMPLATES.UNISWAP.POAP_DESIGN.id,
    },
    {
      title: "Draft Uniswap community newsletter",
      submissionGuideline:
        "Looking for writers, designers, and editors to create and maintain Uniswap’s community newsletter. ",
      templateId: TEMPLATES.UNISWAP.COMMUNITY_NEWSLETTER.id,
    },
  ]

  const newRfps = await db.rfp.createMany({
    data: rfps.map((rfp) => {
      return {
        accountAddress: PARTNERS.UNISWAP.ADDRESS,
        templateId: rfp.templateId,
        data: {
          content: {
            title: rfp.title,
            body: "",
            oneLiner: "",
            submissionGuideline: rfp.submissionGuideline,
          },
        },
      }
    }),
  })

  console.log(newRfps.count + " rfps created for Station")
}

export default seed
